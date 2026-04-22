import React from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  ClassTable,
  Collapse,
  ReportError,
  ResultsCard,
  SketchClassTable,
  useSketchProperties,
} from "@seasketch/geoprocessing/client-ui";
import {
  GeogProp,
  Metric,
  MetricGroup,
  ReportResult,
  flattenBySketchAllClass,
  metricsWithSketchId,
  toNullSketchArray,
  toPercentMetric,
} from "@seasketch/geoprocessing/client-core";
import project from "../../project/projectClient.js";

/**
 * Ous component
 */
export const Ous: React.FunctionComponent<GeogProp> = (props) => {
  const { t } = useTranslation();
  const [{ isCollection }] = useSketchProperties();
  const curGeography = project.getGeographyById(props.geographyId, {
    fallbackGroup: "default-boundary",
  });

  // Metrics
  const metricGroup = project.getMetricGroup("ous", t);
  const precalcMetrics = project.getPrecalcMetrics(
    metricGroup,
    "sum",
    curGeography.geographyId,
  );

  // Labels
  const titleLabel = t("Ocean Use Survey");
  const sectorLabel = t("Sector");
  const mapLabel = t("Map");
  const percWithinLabel = t("% Within Plan");

  return (
    <ResultsCard
      title={titleLabel}
      functionName="ous"
      extraParams={{ geographyIds: [curGeography.geographyId] }}
    >
      {(data: ReportResult) => {
        const percMetricIdName = `${metricGroup.metricId}Perc`;

        const valueMetrics = metricsWithSketchId(
          data.metrics.filter((m) => m.metricId === metricGroup.metricId),
          [data.sketch.properties.id],
        );
        const percentMetrics = toPercentMetric(valueMetrics, precalcMetrics, {
          metricIdOverride: percMetricIdName,
        });
        const metrics = [...valueMetrics, ...percentMetrics];

        return (
          <ReportError>
            <p>
              <Trans i18nKey="Ous 1">
                This report summarizes this plan's overlap with ocean use survey
                data. Plans should consider the potential impact to sectors if
                access or activities are restricted.
              </Trans>
            </p>

            <ClassTable
              rows={metrics}
              metricGroup={metricGroup}
              columnConfig={[
                {
                  columnLabel: sectorLabel,
                  type: "class",
                  width: 30,
                },
                {
                  columnLabel: percWithinLabel,
                  type: "metricChart",
                  metricId: percMetricIdName,
                  valueFormatter: "percent",
                  chartOptions: {
                    showTitle: true,
                  },
                  width: 40,
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
                {genSketchTable(data, metricGroup, precalcMetrics)}
              </Collapse>
            )}

            <Collapse title={t("Learn More")}>
              <Trans i18nKey="Ous - learn more">
                <p>
                  ℹ️ Overview: To capture the value each sector places on
                  different areas of the nearshore, an Ocean Use Survey was
                  conducted. Individuals identified the sectors they participate
                  in, and were asked to draw the areas they use relative to that
                  sector and assign a value of importance. Individual responses
                  were then combined to produce aggregate heatmaps by sector.
                  This allows the value of areas to be quantified, summed, and
                  compared to one another as more or less valuable. Value is
                  then used as a proxy for measuring the potential loss to
                  sectors caused by the creation of protected areas. This report
                  can be used to minimize the potential impact of a plan on a
                  sector, as well as identify and reduce conflict between
                  conservation objectives and sector activities. The higher the
                  proportion of value within the plan, the greater the potential
                  impact to the activity if access is restricted. Note, the
                  resulting heatmaps are only representative of the individuals
                  that were surveyed.
                </p>
                <p>
                  🗺️ Methods:{" "}
                  <a
                    href="https://seasketch.github.io/python-sap-map/index.html"
                    target="_blank"
                  >
                    Spatial Access Priority Mapping
                  </a>
                </p>
                <p>
                  📈 Report: Percentages are calculated by summing the ocean use
                  value within the MPAs in this plan, and dividing it by all
                  sector value. If the plan includes multiple areas that
                  overlap, the overlap is only counted once. This report shows
                  the percentage of ocean use value that is contained by the
                  proposed plan.
                </p>
              </Trans>
            </Collapse>
          </ReportError>
        );
      }}
    </ResultsCard>
  );
};

const genSketchTable = (
  data: ReportResult,
  metricGroup: MetricGroup,
  precalcMetrics: Metric[],
) => {
  // Build agg metric objects for each child sketch in collection with percValue for each class
  const childSketches = toNullSketchArray(data.sketch);
  const childSketchIds = childSketches.map((sk) => sk.properties.id);
  const childSketchMetrics = toPercentMetric(
    metricsWithSketchId(
      data.metrics.filter((m) => m.metricId === metricGroup.metricId),
      childSketchIds,
    ),
    precalcMetrics,
  );
  const sketchRows = flattenBySketchAllClass(
    childSketchMetrics,
    metricGroup.classes,
    childSketches,
  );
  return (
    <SketchClassTable rows={sketchRows} metricGroup={metricGroup} formatPerc />
  );
};
