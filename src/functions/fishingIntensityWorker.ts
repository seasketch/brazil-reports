import {
  Sketch,
  SketchCollection,
  Polygon,
  MultiPolygon,
  GeoprocessingHandler,
  splitSketchAntimeridian,
  Feature,
  isVectorDatasource,
  overlapFeatures,
} from "@seasketch/geoprocessing";
import bbox from "@turf/bbox";
import project from "../../project/projectClient.js";
import {
  Geography,
  Metric,
  MetricGroup,
} from "@seasketch/geoprocessing/client-core";
import { clipToGeography } from "../util/clipToGeography.js";
import { fgbFetchAll } from "@seasketch/geoprocessing/dataproviders";
import { overlapFeaturesFlip } from "../../scripts/overlapFeaturesFlip.js";

/**
 * fishingIntensityWorker: A geoprocessing function that calculates overlap metrics
 * @param sketch - A sketch or collection of sketches
 * @param extraParams
 * @returns Calculated metrics and a null sketch
 */
export async function fishingIntensityWorker(
  sketch:
    | Sketch<Polygon | MultiPolygon>
    | SketchCollection<Polygon | MultiPolygon>,
  extraParams: {
    metricGroup: MetricGroup;
    classId: string;
    geography: Geography;
  }
) {
  const geography = extraParams.geography;
  const metricGroup = extraParams.metricGroup;
  const curClass = metricGroup.classes.find(
    (c) => c.classId === extraParams.classId
  );

  if (!curClass || !curClass.datasourceId)
    throw new Error(`Expected datasourceId for ${curClass}`);

  // Clip sketch to geography
  // const clippedSketch = await clipToGeography(sketch, geography);

  // Get bounding box of sketch remainder
  const sketchBox = sketch.bbox || bbox(sketch);

  const ds = project.getDatasourceById(curClass.datasourceId);
  if (!isVectorDatasource(ds))
    throw new Error(`Expected vector datasource for ${ds.datasourceId}`);

  const url = project.getDatasourceUrl(ds);

  // Fetch features overlapping with sketch, pull from cache if already fetched
  const features = await fgbFetchAll<Feature<Polygon | MultiPolygon>>(
    url,
    sketchBox
  );

  // If this is a sub-class, filter by class name
  const finalFeatures =
    curClass.classKey && curClass.classId !== `${ds.datasourceId}_all`
      ? features.filter((feat) => {
          return (
            feat.geometry &&
            feat.properties![ds.classKeys[0]] === curClass.classId
          );
        }, [])
      : features;

  // Calculate overlap metrics
  const overlapResult = await overlapFeaturesFlip(
    metricGroup.metricId,
    finalFeatures,
    sketch
  );

  return overlapResult.map(
    (metric): Metric => ({
      ...metric,
      classId: curClass.classId,
      geographyId: geography.geographyId,
    })
  );
}

export default new GeoprocessingHandler(fishingIntensityWorker, {
  title: "fishingIntensityWorker",
  description: "",
  timeout: 500, // seconds
  memory: 2048, // megabytes
  executionMode: "sync",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
});
