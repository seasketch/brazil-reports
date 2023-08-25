import {
  Sketch,
  Feature,
  GeoprocessingHandler,
  Metric,
  Polygon,
  ReportResult,
  SketchCollection,
  toNullSketch,
  overlapFeatures,
  rekeyMetrics,
  getFlatGeobufFilename,
  isInternalVectorDatasource,
  Point,
  sketchToId,
  isSketchCollection,
} from "@seasketch/geoprocessing";
import { fgbFetchAll } from "@seasketch/geoprocessing/dataproviders";
import bbox from "@turf/bbox";
import project from "../../project";
import pointsWithinPolygon from "@turf/points-within-polygon";
import { multiPoint } from "@turf/helpers"

export async function windTowerOverlap(
  sketch: Sketch<Polygon> | SketchCollection<Polygon>
): Promise<ReportResult> {
  const box = sketch.bbox || bbox(sketch);
  const metricGroup = project.getMetricGroup("windTowerOverlap");

  let cachedFeatures: Record<string, Feature<Point>[]> = {};

  // features within bounding box of sketch
  const pointsByBoundary = (
    await Promise.all(
      metricGroup.classes.map(async (curClass) => {
        if (!curClass.datasourceId) {
          throw new Error(`Missing datasourceId ${curClass.classId}`);
        }
        const ds = project.getDatasourceById(curClass.datasourceId);
        if (isInternalVectorDatasource(ds)) {
          const url = `${project.dataBucketUrl()}${getFlatGeobufFilename(ds)}`;

          // Fetch features overlapping with sketch, pull from cache if already fetched
          const dsFeatures =
            cachedFeatures[curClass.datasourceId] ||
            (await fgbFetchAll<Feature<Point>>(url, box));
          cachedFeatures[curClass.datasourceId] = dsFeatures;

          // If this is a sub-class, filter by class name, exclude null geometry too
          // ToDo: should do deeper match to classKey
          const finalFeatures =
            ds.classKeys.length > 0
              ? dsFeatures.filter((feat) => {
                return (
                  feat.geometry &&
                  feat.properties![ds.classKeys[0]] === curClass.classId
                );
              }, [])
              : dsFeatures;

          return finalFeatures;
        }
        return [];
      })
    )
  ).reduce<Record<string, Feature<Point>[]>>((acc, polys, classIndex) => {
    return {
      ...acc,
      [metricGroup.classes[classIndex].classId]: polys,
    };
  }, {});

  // loop through sketches and metricGroup classes if collection, else just loop through classes
  const metrics: Metric[] = isSketchCollection(sketch) ?
    sketch.features.map((curSketch) => {
      const curMetrics: Metric[] = (
        metricGroup.classes.map((curClass) => {
          const curId = curClass.classId
          // iterate through point features within current class and pull out the coordinates into array
          const classGeoms = pointsByBoundary[curId].map(curPoints => {
            const geoms = curPoints['geometry']['coordinates']
            return geoms
          });
          // convert array of point coords into turf multipoint object
          const multiPointGeom = multiPoint(classGeoms)
          // find number of points that overlap sketch and create metrics object
          const overlapPoints = pointsWithinPolygon(multiPointGeom, curSketch)
          // if no overlap features exist, assign 0 overlapCount
          const overlapCount = overlapPoints["features"].length > 0 ?
            overlapPoints["features"][0]["geometry"]["coordinates"].length : 0
          const classMetric = {
            classId: curId,
            geographyId: null,
            groupId: null,
            metricId: metricGroup.metricId,
            sketchId: curSketch.properties.id,
            value: overlapCount,
            extra: {
              sketchName: curSketch.properties.name,
              isCollection: curSketch.properties.isCollection
            }
          }
          return classMetric
        })
      )
      return curMetrics
    }).reduce(
      // merge
      (metricsSoFar, curClassMetrics) => [...metricsSoFar, ...curClassMetrics],
      []
    ) : (
      metricGroup.classes.map((curClass) => {
        const curId = curClass.classId
        // iterate through point features within current class and pull out the coordinates into array
        const classGeoms = pointsByBoundary[curId].map(curPoints => {
          const geoms = curPoints['geometry']['coordinates']
          return geoms
        });
        // convert array of point coords into turf multipoint object
        const multiPointGeom = multiPoint(classGeoms)
        // find number of points that overlap sketch and create metrics object
        const overlapPoints = pointsWithinPolygon(multiPointGeom, sketch)
        // if no overlap features exist, assign 0 overlapCount
        const overlapCount = overlapPoints["features"].length > 0 ?
          overlapPoints["features"][0]["geometry"]["coordinates"].length : 0
        const classMetric = {
          classId: curId,
          geographyId: null,
          groupId: null,
          metricId: metricGroup.metricId,
          sketchId: sketch.properties.id,
          value: overlapCount,
          extra: {
            sketchName: sketch.properties.name,
            isCollection: sketch.properties.isCollection
          }
        }
        return classMetric
      })
    )


  return {
    metrics: rekeyMetrics(metrics),
    sketch: toNullSketch(sketch, true),
  };
}

export default new GeoprocessingHandler(windTowerOverlap, {
  title: "windTowerOverlap",
  description: "Calculate sketch overlap with wind towers",
  executionMode: "async",
  timeout: 600,
  requiresProperties: [],
});
