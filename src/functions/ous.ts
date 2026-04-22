import {
  Sketch,
  SketchCollection,
  Polygon,
  MultiPolygon,
  GeoprocessingHandler,
  getFirstFromParam,
  DefaultExtraParams,
  splitSketchAntimeridian,
  rasterMetrics,
  isRasterDatasource,
} from "@seasketch/geoprocessing";
import project from "../../project/projectClient.js";
import {
  Metric,
  ReportResult,
  rekeyMetrics,
  sortMetrics,
  toNullSketch,
} from "@seasketch/geoprocessing/client-core";
import { loadCog } from "@seasketch/geoprocessing/dataproviders";

export async function ous(
  sketch:
    | Sketch<Polygon | MultiPolygon>
    | SketchCollection<Polygon | MultiPolygon>,
): Promise<ReportResult> {
  // Calculate overlap metrics for each class in metric group
  const metricGroup = project.getMetricGroup("ous");
  const metrics: Metric[] = (
    await Promise.all(
      metricGroup.classes.map(async (curClass) => {
        if (!curClass.datasourceId)
          throw new Error(`Expected datasourceId for ${curClass.classId}`);

        const ds = project.getDatasourceById(curClass.datasourceId);
        if (!isRasterDatasource(ds))
          throw new Error(`Expected raster datasource for ${ds.datasourceId}`);

        const url = project.getDatasourceUrl(ds);

        // Start raster load and move on in loop while awaiting finish
        const raster = await loadCog(url);

        // Start analysis when raster load finishes
        const overlapResult = await rasterMetrics(raster, {
          metricId: metricGroup.metricId,
          feature: sketch,
          ...(ds.measurementType === "quantitative" && { stats: ["sum"] }),
        });

        return overlapResult.map(
          (metrics): Metric => ({
            ...metrics,
            classId: curClass.classId,
          }),
        );
      }),
    )
  ).reduce(
    // merge
    (metricsSoFar, curClassMetrics) => [...metricsSoFar, ...curClassMetrics],
    [],
  );

  // Return a report result with metrics and a null sketch
  return {
    metrics: sortMetrics(rekeyMetrics(metrics)),
    sketch: toNullSketch(sketch, true),
  };
}

export default new GeoprocessingHandler(ous, {
  title: "ous",
  description: "",
  timeout: 500, // seconds
  memory: 1024, // megabytes
  executionMode: "async",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
});
