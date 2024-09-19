import React from "react";
import {
  ReportResult,
  percentWithEdge,
  keyBy,
  toNullSketchArray,
  nestMetrics,
  valueFormatter,
  toPercentMetric,
  MetricGroup,
  squareMeterToKilometer,
  Metric,
  firstMatchingMetric,
} from "@seasketch/geoprocessing/client-core";
import {
  ClassTable,
  Collapse,
  Column,
  ReportTableStyled,
  ResultsCard,
  Table,
  useSketchProperties,
  ToolbarCard,
  InfoStatus,
  KeySection,
} from "@seasketch/geoprocessing/client-ui";
import { styled } from "styled-components";
import project from "../../project/projectClient.js";
import Translator from "../components/TranslatorAsync.js";
import { Trans, useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import watersImgUrl from "../assets/img/territorial_waters.png";

// Hard code total area of eez
const boundaryTotalMetrics: Metric[] = [
  {
    classId: "brazil_eez",
    metricId: "boundaryAreaOverlap",
    sketchId: null,
    groupId: null,
    geographyId: "eez",
    value: 3216510833921,
  },
];

const Number = new Intl.NumberFormat("en", { style: "decimal" });

const TableStyled = styled(ReportTableStyled)`
  font-size: 12px;
  td {
    text-align: right;
  }

  tr:nth-child(1) > th:nth-child(n + 1) {
    text-align: center;
  }

  tr:nth-child(2) > th:nth-child(n + 1) {
    text-align: center;
  }

  tr > td:nth-child(1),
  tr > th:nth-child(1) {
    border-right: 1px solid #777;
  }

  tr:nth-child(1) > th:nth-child(2) {
    border-right: 1px solid #777;
  }

  tr > td:nth-child(3),
  tr > th:nth-child(3) {
    border-right: 1px solid #777;
  }
  tr > td:nth-child(5),
  tr > th:nth-child(5) {
    border-right: 1px solid #777;
  }
`;

export const SizeCard = () => {
  const [{ isCollection }] = useSketchProperties();
  const { t } = useTranslation();
  const metricGroup = project.getMetricGroup("boundaryAreaOverlap", t);

  const notFoundString = t("Results not found");

  /* i18next-extract-disable-next-line */
  const planningUnitName = t(project.basic.planningAreaName);
  return (
    <ResultsCard
      title={t("Size")}
      functionName="boundaryAreaOverlap"
      useChildCard
    >
      {(data: ReportResult) => {
        if (Object.keys(data).length === 0) throw new Error(notFoundString);

        const sketchAreaMetric = firstMatchingMetric(
          data.metrics,
          (m) => m.sketchId === data.sketch.properties.id
        );

        return (
          <>
            <ToolbarCard
              title={t(" ")}
              items={
                <>
                  <InfoStatus
                    size={30}
                    msg={
                      <span>
                        <Trans i18nKey="Report info status">
                          These are <b>draft</b> reports. Further changes or
                          corrections may be made. Please report any issues.
                          <br></br>
                          <br></br>
                        </Trans>
                      </span>
                    }
                  />
                </>
              }
            >
              <p>
                {planningUnitName}{" "}
                <Trans i18nKey="SizeCard - introduction">
                  national waters extend from the shoreline out to 200 nautical
                  miles, known as the Exclusive Economic Zone (EEZ). This report
                  summarizes offshore plan overlap with the EEZ and other
                  boundaries within it, measuring progress towards achieving %
                  targets for each boundary.
                </Trans>
              </p>
              <p>
                <Trans i18nKey="SizeCard - protected coastland">
                  {/* present amount of existing protected coastal land and total with proposed plan */}
                  Currently,{" "}
                  <b>
                    115,433.7 km<sup>2</sup>
                  </b>{" "}
                  of coastal land is protected.
                </Trans>
              </p>
              <KeySection>
                <div style={{ textAlign: "center" }}>
                  {t("Proposed plan + protected coastland")} =
                  <b>
                    {" " +
                      Math.round(
                        // get value of last object in metric array which will represent either the sole sketch or the total for a collection
                        sketchAreaMetric.value / 1e6 + 115433.7
                      ).toLocaleString("en-US")}
                    km<sup>2</sup>
                  </b>
                </div>
              </KeySection>
              {genSingleSizeTable(data, metricGroup, t)}
              {isCollection && (
                <Collapse title={t("Show by MPA")}>
                  {genNetworkSizeTable(data, metricGroup, t)}
                </Collapse>
              )}
              <Collapse title={t("Learn more")}>
                <p>
                  <img src={watersImgUrl} style={{ maxWidth: "100%" }} />
                  <a
                    target="_blank"
                    href="https://en.wikipedia.org/wiki/Territorial_waters"
                  >
                    <Trans i18nKey="SizeCard - learn more source">
                      Source: Wikipedia - Territorial Waters
                    </Trans>
                  </a>
                </p>
                <Trans i18nKey="SizeCard - learn more">
                  <p>
                    {" "}
                    This report summarizes the size and proportion of this plan
                    within these boundaries.
                  </p>
                  <p>
                    If sketch boundaries within a plan overlap with each other,
                    the overlap is only counted once.
                  </p>
                </Trans>
              </Collapse>
            </ToolbarCard>
          </>
        );
      }}
    </ResultsCard>
  );
};

const genSingleSizeTable = (
  data: ReportResult,
  mg: MetricGroup,
  t: TFunction
) => {
  const boundaryLabel = t("Boundary");
  const foundWithinLabel = t("Found Within Plan");
  const areaWithinLabel = t("Area Within Plan");
  const areaPercWithinLabel = `% ${t("Area Within Plan")}`;
  const mapLabel = t("Map");
  const sqKmLabel = t("km²");

  const classesById = keyBy(mg.classes, (c) => c.classId);
  let singleMetrics = data.metrics.filter(
    (m) => m.sketchId === data.sketch.properties.id
  );

  // singleMetrics[0].value += 115433731804.85054;

  const finalMetrics = [
    ...singleMetrics,
    ...toPercentMetric(singleMetrics, boundaryTotalMetrics, {
      metricIdOverride: project.getMetricGroupPercId(mg),
    }),
  ];

  return (
    <>
      <ClassTable
        rows={finalMetrics}
        metricGroup={mg}
        objective={project.getMetricGroupObjectives(mg, t)}
        columnConfig={[
          {
            columnLabel: boundaryLabel,
            type: "class",
            width: 25,
          },
          {
            columnLabel: areaWithinLabel,
            type: "metricValue",
            metricId: mg.metricId,
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
            columnLabel: areaPercWithinLabel,
            type: "metricChart",
            metricId: project.getMetricGroupPercId(mg),
            valueFormatter: "percent",
            chartOptions: {
              showTitle: true,
              showTargetLabel: true,
              targetLabelPosition: "bottom",
              targetLabelStyle: "tight",
              barHeight: 11,
            },
            width: 40,
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
    </>
  );
};

const genNetworkSizeTable = (
  data: ReportResult,
  mg: MetricGroup,
  t: TFunction
) => {
  const sketches = toNullSketchArray(data.sketch);
  const sketchesById = keyBy(sketches, (sk) => sk.properties.id);
  const sketchIds = sketches.map((sk) => sk.properties.id);
  const sketchMetrics = data.metrics.filter(
    (m) => m.sketchId && sketchIds.includes(m.sketchId)
  );
  const finalMetrics = [
    ...sketchMetrics,
    ...toPercentMetric(sketchMetrics, boundaryTotalMetrics, {
      metricIdOverride: project.getMetricGroupPercId(mg),
    }),
  ];

  const aggMetrics = nestMetrics(finalMetrics, [
    "sketchId",
    "classId",
    "metricId",
  ]);
  // Use sketch ID for each table row, index into aggMetrics
  const rows = Object.keys(aggMetrics).map((sketchId) => ({
    sketchId,
  }));

  const classColumns: Column<{ sketchId: string }>[] = mg.classes.map(
    (curClass, index) => {
      /* i18next-extract-disable-next-line */
      const transString = t(curClass.display);
      return {
        Header: transString,
        style: { color: "#777" },
        columns: [
          {
            Header: t("Area") + " ".repeat(index),
            accessor: (row) => {
              const value =
                aggMetrics[row.sketchId][curClass.classId as string][
                  mg.metricId
                ][0].value;
              return (
                Number.format(Math.round(squareMeterToKilometer(value))) +
                " " +
                t("km²")
              );
            },
          },
          {
            Header: t("% Area") + " ".repeat(index),
            accessor: (row) => {
              const value =
                aggMetrics[row.sketchId][curClass.classId as string][
                  project.getMetricGroupPercId(mg)
                ][0].value;
              return percentWithEdge(value);
            },
          },
        ],
      };
    }
  );

  interface SketchRow {
    sketchId: string;
  }

  const columns: Column<SketchRow>[] = [
    {
      Header: " ",
      accessor: (row) => <b>{sketchesById[row.sketchId].properties.name}</b>,
    },
    ...classColumns,
  ];

  return (
    <TableStyled>
      <Table columns={columns} data={rows} />
    </TableStyled>
  );
};

/**
 * SizeCard as a top-level report client
 */
export const SizeCardReportClient = () => {
  return (
    <Translator>
      <SizeCard />
    </Translator>
  );
};
