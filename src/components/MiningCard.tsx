import React, { useState } from "react";
import {
  Collapse,
  ClassTable,
  SketchClassTable,
  ResultsCard,
  useSketchProperties,
  ToolbarCard,
  LayerToggle,
} from "@seasketch/geoprocessing/client-ui";
import {
  ReportResult,
  toNullSketchArray,
  flattenBySketchAllClass,
  metricsWithSketchId,
  toPercentMetric,
  squareMeterToKilometer,
  valueFormatter,
  sortMetrics,
} from "@seasketch/geoprocessing/client-core";

import project from "../../project";
import Translator from "./TranslatorAsync";
import { Trans, useTranslation } from "react-i18next";

const metricGroup = project.getMetricGroup("miningOverlap");
const precalcMetrics = project.getPrecalcMetrics(
  metricGroup,
  "area",
  metricGroup.classKey
);

// Mapping region ids to display names for report
const regions: { [id: string]: string } = {};
regions["all"] = "All";
regions["north"] = "North";
regions["south"] = "South";
regions["northeast"] = "Northeast";
regions["central-east"] = "Central-East";

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
        // useChildCard
      >
        {(data: ReportResult) => {
          const singleMetrics = data.metrics.filter(
            (m) => m.sketchId === data.sketch.properties.id
          );

          const parentMetrics = [
            ...singleMetrics,
            ...toPercentMetric(
              singleMetrics,
              precalcMetrics,
              project.getMetricGroupPercId(metricGroup)
            ),
          ];

          console.log(parentMetrics);

          // grouping metrics by region suffix
          const groupedMetrics = parentMetrics.reduce<Record<string, any>>(
            (groups, metric) => {
              // get region id from classId suffix (i.e. "south", "central-east")
              const region: string | undefined = metric.classId
                ?.replace("mining_potential_", "")
                .replace("mining_active_", "");

              if (!region) {
                console.log(metric.classId);
                return groups;
              }
              // adds metric to the region's metric array
              groups[region] = [...(groups[region] || []), metric];
              return groups;
            },
            {}
          );

          return (
            <>
              <p>
                {t("Mining overlap with region:  ")}
                <select onChange={regionSwitcher}>
                  {Object.keys(regions).map((region: string) => {
                    return (
                      <option key={region} value={region}>
                        {regions[region]}
                      </option>
                    );
                  })}
                </select>
              </p>
              <ClassTable
                rows={groupedMetrics[region]}
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
              <Collapse title={t("Learn more")}>
                <p>
                  This report summarizes overlap with active and potential
                  mining areas by region.
                </p>
              </Collapse>
            </>
          );
        }}
      </ResultsCard>
    </>
  );
};
