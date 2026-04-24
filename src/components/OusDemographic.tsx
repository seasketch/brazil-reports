import React from "react";
import {
  Collapse,
  ResultsCard,
  KeySection,
  InfoStatus,
  ClassTable,
  useSketchProperties,
} from "@seasketch/geoprocessing/client-ui";
import {
  toPercentMetric,
  percentWithEdge,
  Metric,
} from "@seasketch/geoprocessing/client-core";
import totals from "../../data/bin/ousDemographicPrecalcTotals.json";
import project from "../../project/projectClient.js";
import { Trans, useTranslation } from "react-i18next";
const precalcTotals = totals as Metric[];

const Number = new Intl.NumberFormat("en", { style: "decimal" });

export const OusDemographics: React.FunctionComponent = (props) => {
  const { t } = useTranslation();

  const overallMetricGroup = project.getMetricGroup(
    "ousOverallDemographicOverlap",
    t,
  );
  const sectorMetricGroup = project.getMetricGroup(
    "ousSectorDemographicOverlap",
    t,
  );
  const stateMetricGroup = project.getMetricGroup(
    "ousStateDemographicOverlap",
    t,
  );
  const gearMetricGroup = project.getMetricGroup(
    "ousGearDemographicOverlap",
    t,
  );

  const METRIC_ID = "ousPeopleCount";
  const PERC_METRIC_ID = `${overallMetricGroup.metricId}Perc`;
  const TOTAL_METRIC_ID = `${overallMetricGroup.metricId}Total`;

  const [{ id }] = useSketchProperties();

  return (
    <div style={{ breakInside: "avoid" }}>
      <ResultsCard
        title={t("Ocean Use Demographics")}
        functionName="ousDemographics"
      >
        {(metrics: Metric[]) => {
          // Filter down to people count metrics for top-level sketch
          const singlePeopleCountMetrics = metrics.filter(
            (m) =>
              m.sketchId === String(id) &&
              m.metricId &&
              m.metricId === "ousPeopleCount",
          );

          const singlePeopleTotalCountMetrics = precalcTotals.filter(
            (m) => m.metricId === "ousPeopleCount",
          );

          const singlePeopleTotalCountMetric = precalcTotals.find(
            (m) => m.classId === "ousPeopleCount_all",
          );
          if (!singlePeopleTotalCountMetric)
            throw new Error("Expected to find total people count metric");
          const singlePeopletotalCountFormatted = Number.format(
            singlePeopleTotalCountMetric.value as number,
          );

          const singlePeopleCountMetric = singlePeopleCountMetrics.find(
            (m) => m.classId === "ousPeopleCount_all",
          );
          if (!singlePeopleCountMetric)
            throw new Error("Expected to find sketch people count metric");
          const singlePeopleCountFormatted = Number.format(
            singlePeopleCountMetric.value as number,
          );

          const singlePeopleCountPercMetric = toPercentMetric(
            [singlePeopleCountMetric],
            singlePeopleTotalCountMetrics,
          )[0];
          if (!singlePeopleCountPercMetric)
            throw new Error(
              "Expected to find sketch people count total metric",
            );
          const singlePeopleCountPercFormatted = percentWithEdge(
            singlePeopleCountPercMetric.value,
          );

          const singleFullMetrics = [
            ...singlePeopleCountMetrics,
            ...toPercentMetric(
              singlePeopleCountMetrics,
              singlePeopleTotalCountMetrics,
              { metricIdOverride: PERC_METRIC_ID },
            ),
          ];

          const sectorClassIds = sectorMetricGroup.classes.map(
            (curClass) => curClass.classId,
          );
          const sectorTotalMetrics = singlePeopleTotalCountMetrics
            .filter((m) => m.classId && sectorClassIds.includes(m.classId))
            .map((m) => ({ ...m, metricId: TOTAL_METRIC_ID }));
          const sectorMetrics = singleFullMetrics
            .filter((m) => m.classId && sectorClassIds.includes(m.classId))
            .concat(sectorTotalMetrics);
          const numSectors = sectorMetrics.filter(
            (m) => m.metricId === "ousPeopleCount",
          ).length;
          const numSectorsFormatted = Number.format(numSectors);

          const municipalityClassIds = stateMetricGroup.classes.map(
            (curClass) => curClass.classId,
          );
          const municipalityTotalMetrics = singlePeopleTotalCountMetrics
            .filter(
              (m) => m.classId && municipalityClassIds.includes(m.classId),
            )
            .map((m) => ({ ...m, metricId: TOTAL_METRIC_ID }));
          const municipalityMetrics = singleFullMetrics
            .filter(
              (m) => m.classId && municipalityClassIds.includes(m.classId),
            )
            .concat(municipalityTotalMetrics);
          const numMunicipalities = municipalityMetrics.filter(
            (m) =>
              m.metricId === "ousPeopleCount" && m.classId !== "unknown_state",
          ).length;
          const numMunicipalitiesFormatted = Number.format(numMunicipalities);

          const gearClassIds = gearMetricGroup.classes.map(
            (curClass) => curClass.classId,
          );
          const gearTotalMetrics = singlePeopleTotalCountMetrics
            .filter((m) => m.classId && gearClassIds.includes(m.classId))
            .map((m) => ({ ...m, metricId: TOTAL_METRIC_ID }));
          const gearMetrics = singleFullMetrics
            .filter((m) => m.classId && gearClassIds.includes(m.classId))
            .concat(gearTotalMetrics);
          const numGears = gearMetrics.filter(
            (m) => m.metricId === "ousPeopleCount",
          ).length;
          const numGearsFormatted = Number.format(numGears);

          const sectorLabel = t("Sector");
          const gearTypeLabel = t("Gear Type");
          const municipalityLabel = t("state");
          const totalPeopleLabel = t("Total People");
          const peopleUsingOceanLabel = t("People Affected By Plan");
          const peopleUsingOceanPercLabel = t("% People Affected By Plan");

          return (
            <>
              <InfoStatus
                msg={
                  <>
                    This is a <b>draft</b> report. Further changes or
                    corrections may be made. Please report any issues. Survey
                    results last updated: 4/22/2026
                  </>
                }
              />
              <p>
                <Trans i18nKey="OUS Demographics - intro">
                  This report summarizes the people that use the ocean within
                  this plan, as represented by the Brazil Ocean Use Survey.
                  Plans should consider the potential benefits and impacts to
                  these people if access or activities are restricted. This
                  demographics report includes all Ocean Use Survey responses.
                </Trans>
              </p>

              <KeySection>
                <b>{singlePeopleCountFormatted}</b>
                {t(" of the ")}
                <b>{singlePeopletotalCountFormatted}</b>
                {t(
                  " people represented by this survey use the ocean within this plan. This is ",
                )}
                <b>{singlePeopleCountPercFormatted}</b>
                {t(" of the total people represented. They come from ")}
                <b>
                  {numMunicipalitiesFormatted}
                  {t(" states")}
                </b>
                {t(" across ")}
                <b>
                  {numSectorsFormatted}
                  {numSectors > 1 ? t(" sectors") : t(" sector")}
                </b>
                {t(". Those that fish within this plan use ")}
                <b>
                  {numGearsFormatted} {t("gear types.")}
                </b>
              </KeySection>

              <p>
                <Trans i18nKey="OUS Demographics - breakdown by sector">
                  What follows is a breakdown of the number of people
                  represented <b>by sector</b>.
                </Trans>
              </p>
              <ClassTable
                rows={sectorMetrics}
                metricGroup={sectorMetricGroup}
                columnConfig={[
                  {
                    columnLabel: sectorLabel,
                    type: "class",
                    width: 30,
                  },
                  {
                    columnLabel: totalPeopleLabel,
                    type: "metricValue",
                    metricId: TOTAL_METRIC_ID,
                    valueFormatter: (value) => Number.format(value as number),
                    chartOptions: {
                      showTitle: true,
                    },
                    width: 15,
                    colStyle: { textAlign: "center" },
                  },
                  {
                    columnLabel: peopleUsingOceanLabel,
                    type: "metricValue",
                    metricId: METRIC_ID,
                    valueFormatter: (value) => Number.format(value as number),
                    chartOptions: {
                      showTitle: true,
                    },
                    width: 25,
                    colStyle: { textAlign: "center" },
                  },
                  {
                    columnLabel: peopleUsingOceanPercLabel,
                    type: "metricChart",
                    metricId: PERC_METRIC_ID,
                    valueFormatter: "percent",
                    chartOptions: {
                      showTitle: true,
                    },
                    width: 30,
                  },
                ]}
              />

              <Collapse title={t("Show by Gear Type (Commercial Fishing)")}>
                <Trans i18nKey="OUS Demographics - breakdown by gear type">
                  <p>
                    The following is a breakdown of gear types used by
                    commercial fishers and how specific gear type usage may be
                    impacted by the plan.
                  </p>
                  <p>
                    Note that commercial fishers can and did report multiple
                    gear types within each of their areas, so these gear type
                    totals
                    <i> do not</i> sum to the total number of respondents above.
                  </p>
                </Trans>

                <ClassTable
                  rows={gearMetrics}
                  metricGroup={gearMetricGroup}
                  columnConfig={[
                    {
                      columnLabel: gearTypeLabel,
                      type: "class",
                      width: 30,
                      colStyle: { textAlign: "left" },
                    },
                    {
                      columnLabel: totalPeopleLabel,
                      type: "metricValue",
                      metricId: TOTAL_METRIC_ID,
                      valueFormatter: (value) => Number.format(value as number),
                      chartOptions: {
                        showTitle: true,
                      },
                      width: 15,
                      colStyle: { textAlign: "center" },
                    },
                    {
                      columnLabel: peopleUsingOceanLabel,
                      type: "metricValue",
                      metricId: METRIC_ID,
                      valueFormatter: (value) => Number.format(value as number),
                      chartOptions: {
                        showTitle: true,
                      },
                      width: 15,
                      colStyle: { textAlign: "center" },
                    },
                    {
                      columnLabel: peopleUsingOceanPercLabel,
                      type: "metricChart",
                      metricId: PERC_METRIC_ID,
                      valueFormatter: "percent",
                      chartOptions: {
                        showTitle: true,
                      },
                      width: 25,
                    },
                  ]}
                />
              </Collapse>

              <Collapse title={t("Show by State (All Sectors)")}>
                <p>
                  <Trans i18nKey="OUS Demographics - breakdown by communitiy">
                    The following is a breakdown of the number of people
                    represented that use the ocean within this nearshore plan{" "}
                    <b>by state</b>.
                  </Trans>
                </p>
                <ClassTable
                  rows={municipalityMetrics}
                  metricGroup={stateMetricGroup}
                  columnConfig={[
                    {
                      columnLabel: municipalityLabel,
                      type: "class",
                      width: 35,
                      colStyle: { textAlign: "left" },
                    },
                    {
                      columnLabel: totalPeopleLabel,
                      type: "metricValue",
                      metricId: TOTAL_METRIC_ID,
                      valueFormatter: (value) => Number.format(value as number),
                      chartOptions: {
                        showTitle: true,
                      },
                      width: 15,
                      colStyle: { textAlign: "center" },
                    },
                    {
                      columnLabel: peopleUsingOceanLabel,
                      type: "metricValue",
                      metricId: METRIC_ID,
                      valueFormatter: (value) => Number.format(value as number),
                      chartOptions: {
                        showTitle: true,
                      },
                      width: 20,
                      colStyle: { textAlign: "center" },
                    },
                    {
                      columnLabel: peopleUsingOceanPercLabel,
                      type: "metricChart",
                      metricId: PERC_METRIC_ID,
                      valueFormatter: "percent",
                      chartOptions: {
                        showTitle: true,
                      },
                      width: 30,
                    },
                  ]}
                />
              </Collapse>

              <Collapse title={t("Learn more")}>
                <Trans i18nKey="OUS Demographics - learn more">
                  <p>
                    ℹ️ Overview: an Ocean Use Survey was conducted that
                    identified who is using the ocean, and where they are using
                    it.
                  </p>
                  <p>
                    This report provides a breakdown of the people that use the
                    ocean within this plan, by sector, gear type, and state.
                  </p>
                  <p>
                    Note, this report is only representative of the individuals
                    that were surveyed and the number of people they were said
                    to represent.
                  </p>
                  <p>
                    🎯 Planning Objective: there is no specific objective/target
                    for limiting the potential impact to groups of people.
                  </p>
                  <p>
                    📈 Report: Percentages are calculated by summing the number
                    of people that use the ocean within the boundaries of this
                    plan for each sector and dividing it by the total number of
                    people that use the ocean within the sector. The same is
                    done for commercial fishing gear types and communities. Note
                    that shapes were clipped to the EEZ boundary, so the number
                    of people represented in this report may be lower than the
                    total number of people who completed the survey.
                  </p>
                </Trans>
              </Collapse>
            </>
          );
        }}
      </ResultsCard>
    </div>
  );
};
