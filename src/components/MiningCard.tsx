import React, { useState } from "react";
import {
  Collapse,
  ClassTable,
  SketchClassTable,
  ResultsCard,
  useSketchProperties,
  ToolbarCard,
  DataDownload,
} from "@seasketch/geoprocessing/client-ui";
import {
  ReportResult,
  toNullSketchArray,
  flattenBySketchAllClass,
  metricsWithSketchId,
  toPercentMetric,
  squareMeterToKilometer,
} from "@seasketch/geoprocessing/client-core";

import project from "../../project/projectClient.js";
import { Trans, useTranslation } from "react-i18next";
import { Download } from "@styled-icons/bootstrap/Download";

const metricGroup = project.getMetricGroup("miningOverlap");
const geographyId = "eez";
const precalcMetrics = project.getPrecalcMetrics(
  metricGroup,
  "area",
  geographyId
);

const Number = new Intl.NumberFormat("en", { style: "decimal" });

export const MiningCard = () => {
  const [{ isCollection }] = useSketchProperties();
  const { t } = useTranslation();

  const mapLabel = t("Map");
  const typeLabel = t("Type");
  const areaWithin = t("Area Within Plan");
  const percAreaWithin = `% ${t("Area Within Plan")}`;
  const sqKmLabel = t("km²");

  const [region, setRegionVisible] = useState("all");

  const regionSwitcher = (e: any) => {
    setRegionVisible(e.target.value);
  };

  return (
    <>
      <ResultsCard
        title={t("Mining Areas")}
        functionName="miningOverlap"
        useChildCard
      >
        {(data: ReportResult) => {
          const singleMetrics = data.metrics.filter(
            (m) => m.sketchId === data.sketch.properties.id
          );

          const parentMetrics = [
            ...singleMetrics,
            ...toPercentMetric(singleMetrics, precalcMetrics, {
              metricIdOverride: project.getMetricGroupPercId(metricGroup),
            }),
          ];

          return (
            <ToolbarCard
              title={t("Mining Areas")}
              items={
                <DataDownload
                  filename="miningAreas"
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
              }
            >
              <ClassTable
                rows={parentMetrics}
                metricGroup={metricGroup}
                columnConfig={[
                  {
                    columnLabel: typeLabel,
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
                    },
                    width: 45,
                  },
                  {
                    columnLabel: mapLabel,
                    type: "layerToggle",
                    width: 10,
                  },
                ]}
              />
              {isCollection && (
                <Collapse title={t("Show by MPA")}>
                  {genSketchTable(data)}
                </Collapse>
              )}
              <Collapse title={t("Learn more")}>
                <Trans i18nKey="Mining Card - learn more">
                  <p>
                    This report summarizes overlap with active and potential
                    mining areas.
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
