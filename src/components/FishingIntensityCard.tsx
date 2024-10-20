import React from "react";
import {
  Collapse,
  ClassTable,
  SketchClassTable,
  ResultsCard,
  useSketchProperties,
  ToolbarCard,
  LayerToggle,
  DataDownload,
} from "@seasketch/geoprocessing/client-ui";
import {
  ReportResult,
  toNullSketchArray,
  flattenBySketchAllClass,
  metricsWithSketchId,
  toPercentMetric,
  squareMeterToKilometer,
  valueFormatter,
  Metric,
} from "@seasketch/geoprocessing/client-core";
import { SketchClassTableOrdered } from "./SketchClassTableOrdered.js";
import { Download } from "@styled-icons/bootstrap/Download";

import project from "../../project/projectClient.js";
import Translator from "./TranslatorAsync.js";
import { Trans, useTranslation } from "react-i18next";

const metricGroup = project.getMetricGroup("fishingIntensity");
const geographyId = "eez";
const precalcMetrics = project.getPrecalcMetrics(
  metricGroup,
  "area",
  geographyId
);

const Number = new Intl.NumberFormat("en", { style: "decimal" });

export const FishingIntensityCard = () => {
  const [{ isCollection }] = useSketchProperties();
  const { t } = useTranslation();

  const mapLabel = t("Map");
  const classLabel = t("Intensity Class");
  const areaWithin = t("Area Overlap");
  const percAreaWithin = `% ${t("Class Area Overlap")}`;
  const percPlanAreaWithin = `% ${t("Plan Area Overlap")}`;
  const sqKmLabel = t("km²");

  return (
    <>
      <ResultsCard
        title={t("Fishing Intensity")}
        functionName="fishingIntensity"
        useChildCard
      >
        {(data: ReportResult) => {
          let singleMetrics = data.metrics.filter(
            (m) => m.sketchId === data.sketch.properties.id
          );

          const classOrder = ["Very Low", "Low", "Medium", "High", "Very High"];

          singleMetrics.sort((a, b) => {
            return (
              classOrder.indexOf(a.classId!) - classOrder.indexOf(b.classId!)
            );
          });

          // need better way to type protect this, and line 287
          const flipMetrics: Metric[] = singleMetrics.map((m) => {
            return typeof m.extra?.sketchOverlapProportion === "number"
              ? {
                  ...m,
                  metricId: "fishingIntensityFlipOverlap",
                  value: m.extra.sketchOverlapProportion,
                }
              : {
                  ...m,
                };
          });

          const finalMetrics = [
            ...singleMetrics,
            ...toPercentMetric(singleMetrics, precalcMetrics, {
              metricIdOverride: project.getMetricGroupPercId(metricGroup),
            }),
            ...flipMetrics,
          ];

          return (
            <ToolbarCard
              title={t("Fishing Intensity")}
              items={
                <>
                  <LayerToggle
                    label={mapLabel}
                    layerId={metricGroup.layerId}
                    simple
                    style={{ marginRight: "10px" }}
                  />
                  <DataDownload
                    filename="fishingIntensity"
                    data={data.metrics}
                    placement="left"
                    formats={["csv", "json"]}
                    titleElement={
                      <Download
                        size={18}
                        color="#999"
                        style={{ cursor: "pointer" }}
                      />
                    }
                  />
                </>
              }
            >
              <Translator>
                <ClassTable
                  rows={finalMetrics}
                  metricGroup={metricGroup}
                  columnConfig={[
                    {
                      columnLabel: classLabel,
                      type: "class",
                      width: 23,
                    },
                    {
                      columnLabel: areaWithin,
                      type: "metricValue",
                      metricId: metricGroup.metricId,
                      valueFormatter: (val: string | number) =>
                        Number.format(
                          Math.round(
                            squareMeterToKilometer(
                              typeof val === "string" ? parseInt(val) : val
                            )
                          )
                        ),
                      valueLabel: sqKmLabel,
                      width: 20,
                    },
                    {
                      columnLabel: percAreaWithin,
                      type: "metricChart",
                      metricId: project.getMetricGroupPercId(metricGroup),
                      valueFormatter: "percent",
                      chartOptions: {
                        showTitle: true,
                        targetLabelPosition: "bottom",
                        targetLabelStyle: "tight",
                        barHeight: 11,
                      },
                      width: 20,
                      targetValueFormatter: (
                        value: number,
                        row: number,
                        numRows: number
                      ) => {
                        if (row === 0) {
                          return (value: number) =>
                            `${valueFormatter(value / 100, "percent0dig")} ${t(
                              "Target"
                            )}`;
                        } else {
                          return (value: number) =>
                            `${valueFormatter(value / 100, "percent0dig")}`;
                        }
                      },
                    },
                    {
                      columnLabel: percPlanAreaWithin,
                      type: "metricChart",
                      metricId: "fishingIntensityFlipOverlap",
                      valueFormatter: "percent",
                      chartOptions: {
                        showTitle: true,
                        targetLabelPosition: "bottom",
                        targetLabelStyle: "tight",
                        barHeight: 11,
                      },
                      width: 20,
                      targetValueFormatter: (
                        value: number,
                        row: number,
                        numRows: number
                      ) => {
                        if (row === 0) {
                          return (value: number) =>
                            `${valueFormatter(value / 100, "percent0dig")} ${t(
                              "Target"
                            )}`;
                        } else {
                          return (value: number) =>
                            `${valueFormatter(value / 100, "percent0dig")}`;
                        }
                      },
                    },
                  ]}
                />
              </Translator>

              {isCollection && (
                <Collapse title={t("Show Class Overlap by MPA")}>
                  {genSketchTable(data)}
                </Collapse>
              )}

              {isCollection && (
                <Collapse title={t("Show Plan Overlap by MPA")}>
                  {genFlipSketchTable(data)}
                </Collapse>
              )}

              <Collapse title={t("Learn more")}>
                {/* <Trans i18nKey="Fishing Intensity Card - learn more"> */}
                <p>
                  {" "}
                  This report summarizes the amount of fishing intensity overlap
                  within this plan. Fishing intensity is fishing effort per unit
                  area - intensity values have been grouped into 5 classes.
                </p>
                <p>
                  <b>Class Area Overlap</b> and <b>Plan Area Overlap</b> are
                  defined as follows:
                  <li>
                    <b>Class Area Overlap</b>: The percentage of a given
                    intensity class's area that overlaps with the proposed plan.
                  </li>
                  <li>
                    <b>Plan Area Overlap</b>: The percentage of the{" "}
                    <i>proposed plan's area</i> that overlaps with the given
                    intensity class.
                  </li>
                </p>
                <p>
                  If zone boundaries overlap with each other, the overlap is
                  only counted once.
                </p>
                {/* </Trans> */}
              </Collapse>
            </ToolbarCard>
          );
        }}
      </ResultsCard>
    </>
  );
};

const sketchTableColumnOrder = [
  "MPA",
  "Very Low",
  "Low",
  "Medium",
  "High",
  "Very High",
];

const genSketchTable = (data: ReportResult) => {
  // Build agg metric objects for each child sketch in collection with percValue for each class
  const childSketches = toNullSketchArray(data.sketch);
  const childSketchIds = childSketches.map((sk) => sk.properties.id);
  const childSketchMetrics = toPercentMetric(
    metricsWithSketchId(
      data.metrics.filter((m) => m.metricId === metricGroup.metricId),
      childSketchIds
    ),
    precalcMetrics
  );
  const sketchRows = flattenBySketchAllClass(
    childSketchMetrics,
    metricGroup.classes,
    childSketches
  );
  const classOrder = {
    sketchId: null,
    sketchName: null,
    "Very Low": null,
    Low: null,
    Medium: null,
    High: null,
    "Very High": null,
  };
  const sketchRowsOrdered = sketchRows.map((curSketch) =>
    Object.assign({}, classOrder, curSketch)
  );

  return (
    <SketchClassTableOrdered
      rows={sketchRowsOrdered}
      metricGroup={metricGroup}
      formatPerc
      columnOrder={sketchTableColumnOrder}
    />
  );
};

const genFlipSketchTable = (data: ReportResult) => {
  // Build agg metric objects for each child sketch in collection with percValue for each class
  const childSketches = toNullSketchArray(data.sketch);
  const childSketchIds = childSketches.map((sk) => sk.properties.id);
  const childSketchMetrics = metricsWithSketchId(
    data.metrics.filter((m) => m.metricId === metricGroup.metricId),
    childSketchIds
  );

  const childFlipMetrics = childSketchMetrics.map((m): Metric => {
    return typeof m.extra?.sketchOverlapProportion === "number"
      ? {
          ...m,
          metricId: "fishingIntensityFlipOverlap",
          value: m.extra.sketchOverlapProportion,
        }
      : {
          ...m,
        };
  });

  const childFlipSketchMetrics = metricsWithSketchId(
    childFlipMetrics,
    childSketchIds
  );

  const sketchRows = flattenBySketchAllClass(
    childFlipSketchMetrics,
    metricGroup.classes,
    childSketches
  );
  return (
    <SketchClassTableOrdered
      rows={sketchRows}
      metricGroup={metricGroup}
      formatPerc
      columnOrder={sketchTableColumnOrder}
    />
  );
};
