import {
  Sketch,
  SketchCollection,
  Polygon,
  MultiPolygon,
  GeoprocessingHandler,
  runLambdaWorker,
  parseLambdaResponse,
} from "@seasketch/geoprocessing";
import project from "../../project/projectClient.js";
import {
  DefaultExtraParams,
  GeoprocessingRequestModel,
  Metric,
  ReportResult,
  isMetricArray,
  rekeyMetrics,
  sortMetrics,
  toNullSketch,
} from "@seasketch/geoprocessing/client-core";
import { shippingIntensityWorker } from "./shippingIntensityWorker.js";

/**
 * shippingIntensity: A geoprocessing function that calculates overlap metrics
 * @param sketch - A sketch or collection of sketches
 * @param extraParams
 * @returns Calculated metrics and a null sketch
 */
export async function shippingIntensity(
  sketch:
    | Sketch<Polygon | MultiPolygon>
    | SketchCollection<Polygon | MultiPolygon>,
  extraParams: DefaultExtraParams = {},
  request?: GeoprocessingRequestModel<Polygon | MultiPolygon>
): Promise<ReportResult> {
  const metricGroup = project.getMetricGroup("shippingIntensity");
  const geographies = project.geographies;

  console.log("Running shippingIntensity with sketch", sketch);

  try {
    const allMetrics = await Promise.all(
      geographies.map(async (geography) => {
        const classMetrics = await Promise.all(
          metricGroup.classes.map(async (curClass) => {
            const parameters = {
              ...extraParams,
              geography: geography,
              metricGroup,
              classId: curClass.classId,
            };

            return process.env.NODE_ENV === "test"
              ? shippingIntensityWorker(sketch, parameters)
              : runLambdaWorker(
                  sketch,
                  project.package.name,
                  "shippingIntensityWorker",
                  project.geoprocessing.region,
                  parameters,
                  request!
                );
          })
        );

        return classMetrics.reduce<Metric[]>(
          (metrics, result) =>
            metrics.concat(
              isMetricArray(result)
                ? result
                : (parseLambdaResponse(result) as Metric[])
            ),
          []
        );
      })
    );

    const metrics = allMetrics.flat();

    return {
      metrics: sortMetrics(rekeyMetrics([...metrics])),
      sketch: toNullSketch(sketch, true),
    };
  } catch (error) {
    console.error("Error fetching metrics:", error);
    throw error;
  }
}

export default new GeoprocessingHandler(shippingIntensity, {
  title: "shippingIntensity",
  description: "shippingIntensity overlap",
  timeout: 500, // seconds
  memory: 1024, // megabytes
  executionMode: "async",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
});
