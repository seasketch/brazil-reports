import {
  Sketch,
  SketchCollection,
  Polygon,
  Feature,
  Metric,
  toSketchArray,
  isSketchCollection,
  chunk,
  clip,
  clipMultiMerge,
  createMetric
} from "@seasketch/geoprocessing";
import { featureCollection, MultiPolygon, Point, MultiPoint } from "@turf/helpers";
import { featureEach } from "@turf/meta";
import area from "@turf/area";
import flatten from "@turf/flatten";
import pointsWithinPolygon from "@turf/points-within-polygon";
import { multiPoint } from "@turf/helpers"

interface OverlapPointOptions {
  /** Intersection calls are chunked to avoid infinite loop error, defaults to 5000 features */
  chunkSize: number;
  /** If sketch collection, will include its child sketch metrics in addition to collection metrics, defaults to true */
  includeChildMetrics?: boolean;
  sumProperty?: string;
}

/**
 * Calculates overlap between sketch(es) and an array of point features.
 * If sketch collection includes overall and per sketch
 */
export async function overlapPoints(
  metricId: string,
  /** features to intersect and get overlap stats */
  features: Feature<Point>[],
  /** the sketches.  If empty will return 0 result. */
  sketch:
    | Sketch<Polygon | MultiPolygon>
    | SketchCollection<Polygon | MultiPolygon>
    | Sketch<Polygon | MultiPolygon>[],
  options?: Partial<OverlapPointOptions>
): Promise<Metric[]> {
  const newOptions: OverlapPointOptions = {
    includeChildMetrics: true,
    chunkSize: 5000,
    ...(options || {}),
  };
  const { includeChildMetrics } = newOptions;
  let sumValue: number = 0;
  let isOverlap = false;
  const sketches = Array.isArray(sketch) ? sketch : toSketchArray(sketch);

  if (sketches.length > 0) {
    const sketchColl = flatten(featureCollection(sketches));
    const sketchArea = area(sketchColl);

    // If sketch overlap, use union
    const sketchUnion = clip(sketchColl, "union");
    if (!sketchUnion) throw new Error("overlapFeatures - something went wrong");
    const sketchUnionArea = area(sketchUnion);
    isOverlap = sketchUnionArea < sketchArea;

    const finalSketches =
      sketches.length > 1 && isOverlap ? flatten(sketchUnion) : sketchColl;

    if (isOverlap) {
      featureEach(finalSketches, (feat) => {
        const curSum = doIntersect(
          feat,
          features as Feature<Point>[],
          newOptions
        );
        sumValue += curSum;
      });
    }
  }

  let sketchMetrics: Metric[] = sketches.map((curSketch) => {
    let sketchValue: number = doIntersect(
      curSketch as Feature<Polygon | MultiPolygon>,
      features as Feature<Point>[],
      newOptions
    );
    return createMetric({
      metricId,
      sketchId: curSketch.properties.id,
      value: sketchValue,
      extra: {
        sketchName: curSketch.properties.name,
      },
    });
  });

  if (!isOverlap) {
    sumValue = sketchMetrics.reduce((sumSoFar, sm) => sumSoFar + sm.value, 0);
  }

  const collMetrics: Metric[] = (() => {
    if (isSketchCollection(sketch)) {
      // Push collection with accumulated sumValue
      return [
        createMetric({
          metricId,
          sketchId: sketch.properties.id,
          value: sumValue,
          extra: {
            sketchName: sketch.properties.name,
            isCollection: true,
          },
        }),
      ];
    } else {
      return [];
    }
  })();

  return [...(includeChildMetrics ? sketchMetrics : []), ...collMetrics];
}

// invokes corresponding intersect function based on type of intersect
const doIntersect = (
  featureA: Feature<Polygon | MultiPolygon>,
  featuresB: Feature<Point>[],
  options: OverlapPointOptions
) => {
  const { chunkSize } = options;
  return getSketchPointIntersectCount(featureA, featuresB, chunkSize);
};

const makeMultiPoint = (points: Feature<Point>[]) => {
  const geom = points.map((point) => {
    const curGeom = point.geometry.coordinates
    return curGeom
  })
  const newMultiPoint = multiPoint(geom)
  return newMultiPoint
}

const getSketchPointIntersectCount = (
  featureA: Feature<Polygon | MultiPolygon>,
  featuresB: Feature<Point>[],
  chunkSize: number
) => {
  // chunk to avoid blowing up intersect
  const chunks = chunk(featuresB, chunkSize || 5000);
  // intersect and get area of remainder
  const sketchValue = chunks
    .map((curChunk) => {
      const rem = pointsWithinPolygon(
        makeMultiPoint(curChunk),
        featureA,
      );
      const numPoints = rem.features.length ? rem.features[0].geometry.coordinates.length : 0;
      return numPoints;
    })
    .reduce((sumSoFar, rem) => (sumSoFar + rem), 0);
  return sketchValue;
}
