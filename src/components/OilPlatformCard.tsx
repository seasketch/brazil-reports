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
  valueFormatter,
} from "@seasketch/geoprocessing/client-core";
import { Download } from "@styled-icons/bootstrap/Download";

import project from "../../project/projectClient.js";
import Translator from "./TranslatorAsync.js";
import { Trans, useTranslation } from "react-i18next";

const metricGroup = project.getMetricGroup("oilPlatformOverlap");
const geographyId = "eez";
const precalcMetrics = project.getPrecalcMetrics(
  metricGroup,
  "count",
  geographyId
);

const Number = new Intl.NumberFormat("en", { style: "decimal" });

export const OilPlatformCard = () => {
  const [{ isCollection }] = useSketchProperties();
  const { t } = useTranslation();

  const mapLabel = t("Map");
  const typeLabel = t("Type");
  const pointsWithin = t("Platforms Within Plan");
  const percPointsWithin = `% ${t("Platforms Within Plan")}`;
  const pointLabel = t("Platforms");

  return (
    <>
      <ResultsCard
        title={t("Oil Exploration Platforms")}
        functionName="oilPlatformOverlap"
        useChildCard
      >
        {(data: ReportResult) => {
          let singleMetrics = data.metrics.filter(
            (m) => m.sketchId === data.sketch.properties.id
          );

          const finalMetrics = [
            ...singleMetrics,
            ...toPercentMetric(singleMetrics, precalcMetrics, {
              metricIdOverride: project.getMetricGroupPercId(metricGroup),
            }),
          ];

          return (
            <ToolbarCard
              title={t("Oil Exploration Platforms")}
              items={
                <>
                  <LayerToggle
                    label={mapLabel}
                    layerId={metricGroup.layerId}
                    simple
                    style={{ marginRight: "10px" }}
                  />
                  <DataDownload
                    filename="oilExplorationPlatforms"
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
                      columnLabel: typeLabel,
                      type: "class",
                      width: 23,
                    },
                    {
                      columnLabel: pointsWithin,
                      type: "metricValue",
                      metricId: metricGroup.metricId,
                      valueLabel: pointLabel,
                      width: 30,
                    },
                    {
                      columnLabel: percPointsWithin,
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
                <Trans i18nKey="Oil Platforms - learn more">
                  <p>
                    {" "}
                    This report summarizes overlap with oil exploration
                    platforms.
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
  const childSketchMetrics = metricsWithSketchId(
    data.metrics.filter((m) => m.metricId === metricGroup.metricId),
    childSketchIds
  );
  const sketchRows = flattenBySketchAllClass(
    childSketchMetrics,
    metricGroup.classes,
    childSketches
  );
  return <SketchClassTable rows={sketchRows} metricGroup={metricGroup} />;
};
