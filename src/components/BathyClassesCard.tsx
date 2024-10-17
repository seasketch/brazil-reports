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
} from "@seasketch/geoprocessing/client-core";
import { Download } from "@styled-icons/bootstrap/Download";

import project from "../../project/projectClient.js";
import Translator from "./TranslatorAsync.js";
import { Trans, useTranslation } from "react-i18next";

const metricGroup = project.getMetricGroup("bathyClasses");
const geographyId = "eez";
const precalcMetrics = project.getPrecalcMetrics(
  metricGroup,
  "area",
  geographyId
);

const Number = new Intl.NumberFormat("en", { style: "decimal" });

export const BathyClassesCard = () => {
  const [{ isCollection }] = useSketchProperties();
  const { t } = useTranslation();

  const mapLabel = t("Map");
  const classLabel = t("Depth");
  const areaWithin = t("Area Within Plan");
  const percAreaWithin = `% ${t("Area Within Plan")}`;
  const sqKmLabel = t("km²");

  return (
    <>
      <ResultsCard
        title={t("Bathymetric Classes")}
        functionName="bathyClasses"
        useChildCard
      >
        {(data: ReportResult) => {
          let singleMetrics = data.metrics.filter(
            (m) => m.sketchId === data.sketch.properties.id
          );

          const classOrder = [
            "Plataforma Interna (<50 m)",
            "Plataforma Externa Rasa (50 - 100 m)",
            "Plataforma Externa Profunda (100 - 200 m)",
            "Talude (200 - 1200 m )",
            "Bacia Oceânica (> 1200 m)",
          ];

          singleMetrics.sort((a, b) => {
            return (
              classOrder.indexOf(a.classId!) - classOrder.indexOf(b.classId!)
            );
          });

          const finalMetrics = [
            ...singleMetrics,
            ...toPercentMetric(singleMetrics, precalcMetrics, {
              metricIdOverride: project.getMetricGroupPercId(metricGroup),
            }),
          ];

          return (
            <ToolbarCard
              title={t("Bathymetric Classes")}
              items={
                <>
                  <LayerToggle
                    label={mapLabel}
                    layerId={metricGroup.layerId}
                    simple
                    style={{ marginRight: "10px" }}
                  />
                  <DataDownload
                    filename="bathymetricClasses"
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
              </Translator>

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
