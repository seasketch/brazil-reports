import React from "react";
import {
  Collapse,
  ClassTable,
  SketchClassTable,
  ResultsCard,
  useSketchProperties,
  ToolbarCard,
  LayerToggle,
  Table,
} from "@seasketch/geoprocessing/client-ui";
import {
  ReportResult,
  toNullSketchArray,
  flattenBySketchAllClass,
  metricsWithSketchId,
  toPercentMetric,
  squareMeterToKilometer,
  valueFormatter,
} from "@seasketch/geoprocessing/client-core";

import project from "../../project";
import Translator from "./TranslatorAsync";
import { Trans, useTranslation } from "react-i18next";
import serviceValues from "../util/ecosystemServiceValues.json";

const metricGroup = project.getMetricGroup("habitatsServicesOverlap");
const precalcMetrics = project.getPrecalcMetrics(
  metricGroup,
  "area",
  metricGroup.classKey
);

const Number = new Intl.NumberFormat("en", { style: "decimal" });

export const HabitatsServicesCard = () => {
  const [{ isCollection }] = useSketchProperties();
  const { t } = useTranslation();

  const mapLabel = t("Map");
  const classLabel = t("Depth");
  const areaWithin = t("Area Within Plan");
  const percAreaWithin = `% ${t("Area Within Plan")}`;
  const sqKmLabel = t("km²");

  const habitatTypes = metricGroup.classes.map((c) => c.classId);

  return (
    <>
      <ResultsCard
        title={t("Benthic Habitats and Ecosystem Services")}
        functionName="habitatsServicesOverlap"
        useChildCard
      >
        {(data: ReportResult) => {
          let singleMetrics = data.metrics.filter(
            (m) => m.sketchId === data.sketch.properties.id
          );

          // add ecosystem service values to metrics
          let singleMetricsWithServices = singleMetrics;

          habitatTypes.forEach((hab) => {
            let newMetric = singleMetrics.filter((m) => m.classId === hab);
            const curServiceValues =
              newMetric[0].value > 0
                ? serviceValues.filter((m) => m.habitat === hab)[0]
                : {
                    habitat: hab,
                    food: 0,
                    raw: 0,
                    air: 0,
                    disturbance: 0,
                    photosynthesis: 0,
                    nutrient: 0,
                    reproduction: 0,
                    biodiversity: 0,
                    water: 0,
                    cognitive: 0,
                    leisure: 0,
                    feel_good: 0,
                  };
            newMetric[0].extra!.services = curServiceValues;
            const otherMetrics = singleMetricsWithServices.filter(
              (m) => m.classId !== hab
            );

            singleMetricsWithServices = [...otherMetrics, ...newMetric];
          });

          const finalMetrics = [
            ...singleMetricsWithServices,
            ...toPercentMetric(
              singleMetrics,
              precalcMetrics,
              project.getMetricGroupPercId(metricGroup)
            ),
          ];

          return (
            <ToolbarCard
              title={t("Benthic Habitats and Ecosystem Services")}
              items={
                <LayerToggle
                  label={mapLabel}
                  layerId={metricGroup.layerId}
                  simple
                />
              }
            >
              {/* <Translator>
                <ClassTable
                  rows={finalMetrics}
                  metricGroup={metricGroup}
                  columnConfig={[
                    {
                      columnLabel: classLabel,
                      type: "class",
                      width: 30,
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
                      width: 30,
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
                      width: 30,
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
              </Translator> */}

              <div style={{ overflowX: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Area</th>
                      <th>Food</th>
                      <th>Raw</th>
                      <th>Air</th>
                      <th>Disturbance</th>
                      <th>Photosynthesis</th>
                      <th>Nutrient</th>
                      <th>Reproduction</th>
                      <th>Biodiversity</th>
                      <th>Water</th>
                      <th>Cognitive</th>
                      <th>Leisure</th>
                      <th>Feel Good</th>
                    </tr>
                  </thead>
                  <tbody>
                    {singleMetrics.map((metric, index) => (
                      <tr key={index}>
                        <td>{metric.classId}</td>
                        <td>{(metric.value / 1e6).toFixed(2)}</td>
                        <td>
                          {metric.extra!.services["food"] === 1 ? "✅" : "❌"}
                        </td>
                        <td>
                          {metric.extra!.services["raw"] === 1 ? "✅" : "❌"}
                        </td>
                        <td>
                          {metric.extra!.services["air"] === 1 ? "✅" : "❌"}
                        </td>
                        <td>
                          {metric.extra!.services["disturbance"] === 1
                            ? "✅"
                            : "❌"}
                        </td>
                        <td>
                          {metric.extra!.services["photosynthesis"] === 1
                            ? "✅"
                            : "❌"}
                        </td>
                        <td>
                          {metric.extra!.services["nutrient"] === 1
                            ? "✅"
                            : "❌"}
                        </td>
                        <td>
                          {metric.extra!.services["reproduction"] === 1
                            ? "✅"
                            : "❌"}
                        </td>
                        <td>
                          {metric.extra!.services["biodiversity"] === 1
                            ? "✅"
                            : "❌"}
                        </td>
                        <td>
                          {metric.extra!.services["water"] === 1 ? "✅" : "❌"}
                        </td>
                        <td>
                          {metric.extra!.services["cognitive"] === 1
                            ? "✅"
                            : "❌"}
                        </td>
                        <td>
                          {metric.extra!.services["leisure"] === 1
                            ? "✅"
                            : "❌"}
                        </td>
                        <td>
                          {metric.extra!.services["feel_good"] === 1
                            ? "✅"
                            : "❌"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {isCollection && (
                <Collapse title={t("Show by MPA")}>
                  {genSketchTable(data)}
                </Collapse>
              )}

              <Collapse title={t("Learn more")}>
                <Trans i18nKey="Bathy Classes Card - learn more">
                  <p>
                    {" "}
                    This report summarizes bathymetric class overlap within this
                    plan.
                  </p>
                  <p>
                    If zone boundaries overlap with each other, the overlap is
                    only counted once.
                  </p>
                </Trans>
              </Collapse>
            </ToolbarCard>
          );
        }}
      </ResultsCard>
    </>
  );
};

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
  return (
    <SketchClassTable rows={sketchRows} metricGroup={metricGroup} formatPerc />
  );
};
