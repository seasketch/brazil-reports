import React, { useState } from "react";
import { styled } from "styled-components";
import {
  Collapse,
  SketchClassTable,
  ResultsCard,
  useSketchProperties,
  ToolbarCard,
  LayerToggle,
  ObjectiveStatus,
  VerticalSpacer,
} from "@seasketch/geoprocessing/client-ui";
import {
  ReportResult,
  toNullSketchArray,
  flattenBySketchAllClass,
  metricsWithSketchId,
  toPercentMetric,
} from "@seasketch/geoprocessing/client-core";

import project from "../../project/projectClient.js";
import Translator from "./TranslatorAsync.js";
import { Trans, useTranslation } from "react-i18next";
import serviceValues from "../util/ecosystemServiceValues.json";
import redX from "../assets/img/red-x.png";
import yellowCheck from "../assets/img/yellow-check.png";
import greenCheck from "../assets/img/green-check.png";

const metricGroup = project.getMetricGroup("habitatsServicesOverlap");
const geographyId = "eez";
const precalcMetrics = project.getPrecalcMetrics(
  metricGroup,
  "area",
  geographyId
);

export const HabitatsServicesCard = () => {
  const [{ isCollection }] = useSketchProperties();
  const { t } = useTranslation();

  const mapLabel = t("Map");

  const habitatTypes = metricGroup.classes.map((c) => c.classId);

  interface Services {
    [key: string]: number;
  }

  const iconHeight = 20;

  interface StatusColor {
    [key: string]: string;
  }

  const statusColor: StatusColor = {
    1: "#FFC865",
    2: "#83CA50",
  };

  const Button = styled.button`
    background-color: white;
    font-size: 13px;
    color: black;
    padding: 3px;
    outline: 0;
    border: 0;
    text-transform: uppercase;
    margin: 0px 8px;
    cursor: pointer;
    transition: ease background-color 250ms;
    &:hover:enabled {
      color: #bcd8e6;
    }
    &:disabled {
      cursor: default;
      opacity: 0.2;
    }
  `;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

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
            const otherMetrics = singleMetrics.filter((m) => m.classId !== hab);

            singleMetrics = [...otherMetrics, ...newMetric];
          });

          const finalMetrics = [
            ...singleMetrics,
            ...toPercentMetric(singleMetrics, precalcMetrics, {
              metricIdOverride: project.getMetricGroupPercId(metricGroup),
            }),
          ];

          // Calculate current items
          const indexOfLastItem = currentPage * itemsPerPage;
          const indexOfFirstItem = indexOfLastItem - itemsPerPage;
          const currentMetrics = singleMetrics.slice(
            indexOfFirstItem,
            indexOfLastItem
          );

          // Pagination controls
          const totalPages = Math.ceil(singleMetrics.length / itemsPerPage);

          const handlePrevPage = () => {
            setCurrentPage((currentPage) => Math.max(1, currentPage - 1));
          };

          const handleNextPage = () => {
            setCurrentPage((currentPage) =>
              Math.min(totalPages, currentPage + 1)
            );
          };

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
              <VerticalSpacer />
              {/* table styling */}
              <style>
                {`
                  .services-table {
                    font-size: 13px;
                  }
                  .services-table th, .services-table td {
                    min-width: 70px;
                    text-align: center;
                    background-color: white;
                    height: 20px;
                  }
                  .services-table th:nth-child(1) {
                    width: 120px;
                    position: absolute;
                    bgcolor: white;
                    padding-top: 8px;
                    padding-bottom: 12px;
                    margin-left: -5px;
                    padding-right: 5px;
                    border-right: 1px solid #525252;
                    border-collapse: collapse;
                  }
                  .services-table td:nth-child(1) {
                    width: 120px;
                    position: absolute;
                    bgcolor: white;
                    padding-top: 12px;
                    padding-bottom: 12px;
                    margin-left: -5px;
                    padding-right: 5px;
                    border-right: 1px solid #525252;
                    border-collapse: collapse;
                  }
                  .services-table th:nth-child(2), .services-table td:nth-child(2) {
                    min-width: 100px;
                    padding-left: 120px;
                  }
                  .container {
                    justify-content: center;
                  }
                `}
              </style>
              <Translator>
                <div style={{ overflowX: "auto" }}>
                  <table className="services-table">
                    <thead>
                      <tr>
                        <th>{t("Habitat")}</th>
                        <th>{t("Area")}</th>
                        <th>{t("Food")}</th>
                        <th>{t("Raw")}</th>
                        <th>{"Air"}</th>
                        <th>{t("Distur- bance")}</th>
                        <th>{t("Photo- synthesis")}</th>
                        <th>{t("Nutrient")}</th>
                        <th>{t("Repro- duction")}</th>
                        <th>{t("Biodiv- ersity")}</th>
                        <th>{t("Water")}</th>
                        <th>{t("Cognitive")}</th>
                        <th>{t("Leisure")}</th>
                        <th>{t("Feel Good")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentMetrics.map((metric, index) => (
                        <tr key={index}>
                          <td>{metric.classId}</td>
                          <td>{(metric.value / 1e6).toFixed(2)} km²</td>
                          <td>
                            {(metric.extra!.services as Services)["food"] ===
                            0 ? (
                              <ObjectiveStatus
                                status={"no"}
                                style={{ height: iconHeight }}
                                msg={<></>}
                              />
                            ) : (
                              <ObjectiveStatus
                                status={"yes"}
                                style={{
                                  color:
                                    statusColor[
                                      (metric.extra!.services as Services)[
                                        "food"
                                      ]
                                    ],
                                  height: iconHeight,
                                }}
                                msg={<></>}
                              />
                            )}
                          </td>
                          <td>
                            {(metric.extra!.services as Services)["raw"] ===
                            0 ? (
                              <ObjectiveStatus
                                status={"no"}
                                style={{ height: iconHeight }}
                                msg={<></>}
                              />
                            ) : (
                              <ObjectiveStatus
                                status={"yes"}
                                style={{
                                  color:
                                    statusColor[
                                      (metric.extra!.services as Services)[
                                        "raw"
                                      ]
                                    ],
                                  height: iconHeight,
                                }}
                                msg={<></>}
                              />
                            )}
                          </td>
                          <td>
                            {(metric.extra!.services as Services)["air"] ===
                            0 ? (
                              <ObjectiveStatus
                                status={"no"}
                                style={{ height: iconHeight }}
                                msg={<></>}
                              />
                            ) : (
                              <ObjectiveStatus
                                status={"yes"}
                                style={{
                                  color:
                                    statusColor[
                                      (metric.extra!.services as Services)[
                                        "air"
                                      ]
                                    ],
                                  height: iconHeight,
                                }}
                                msg={<></>}
                              />
                            )}
                          </td>
                          <td>
                            {(metric.extra!.services as Services)[
                              "disturbance"
                            ] === 0 ? (
                              <ObjectiveStatus
                                status={"no"}
                                style={{ height: iconHeight }}
                                msg={<></>}
                              />
                            ) : (
                              <ObjectiveStatus
                                status={"yes"}
                                style={{
                                  color:
                                    statusColor[
                                      (metric.extra!.services as Services)[
                                        "disturbance"
                                      ]
                                    ],
                                  height: iconHeight,
                                }}
                                msg={<></>}
                              />
                            )}
                          </td>
                          <td>
                            {(metric.extra!.services as Services)[
                              "photosynthesis"
                            ] === 0 ? (
                              <ObjectiveStatus
                                status={"no"}
                                style={{ height: iconHeight }}
                                msg={<></>}
                              />
                            ) : (
                              <ObjectiveStatus
                                status={"yes"}
                                style={{
                                  color:
                                    statusColor[
                                      (metric.extra!.services as Services)[
                                        "photosynthesis"
                                      ]
                                    ],
                                  height: iconHeight,
                                }}
                                msg={<></>}
                              />
                            )}
                          </td>
                          <td>
                            {(metric.extra!.services as Services)[
                              "nutrient"
                            ] === 0 ? (
                              <ObjectiveStatus
                                status={"no"}
                                style={{ height: iconHeight }}
                                msg={<></>}
                              />
                            ) : (
                              <ObjectiveStatus
                                status={"yes"}
                                style={{
                                  color:
                                    statusColor[
                                      (metric.extra!.services as Services)[
                                        "nutrient"
                                      ]
                                    ],
                                  height: iconHeight,
                                }}
                                msg={<></>}
                              />
                            )}
                          </td>
                          <td>
                            {(metric.extra!.services as Services)[
                              "reproduction"
                            ] === 0 ? (
                              <ObjectiveStatus
                                status={"no"}
                                style={{ height: iconHeight }}
                                msg={<></>}
                              />
                            ) : (
                              <ObjectiveStatus
                                status={"yes"}
                                style={{
                                  color:
                                    statusColor[
                                      (metric.extra!.services as Services)[
                                        "reproduction"
                                      ]
                                    ],
                                  height: iconHeight,
                                }}
                                msg={<></>}
                              />
                            )}
                          </td>
                          <td>
                            {(metric.extra!.services as Services)[
                              "biodiversity"
                            ] === 0 ? (
                              <ObjectiveStatus
                                status={"no"}
                                style={{ height: iconHeight }}
                                msg={<></>}
                              />
                            ) : (
                              <ObjectiveStatus
                                status={"yes"}
                                style={{
                                  color:
                                    statusColor[
                                      (metric.extra!.services as Services)[
                                        "biodiversity"
                                      ]
                                    ],
                                  height: iconHeight,
                                }}
                                msg={<></>}
                              />
                            )}
                          </td>
                          <td>
                            {(metric.extra!.services as Services)["water"] ===
                            0 ? (
                              <ObjectiveStatus
                                status={"no"}
                                style={{ height: iconHeight }}
                                msg={<></>}
                              />
                            ) : (
                              <ObjectiveStatus
                                status={"yes"}
                                style={{
                                  color:
                                    statusColor[
                                      (metric.extra!.services as Services)[
                                        "water"
                                      ]
                                    ],
                                  height: iconHeight,
                                }}
                                msg={<></>}
                              />
                            )}
                          </td>
                          <td>
                            {(metric.extra!.services as Services)[
                              "cognitive"
                            ] === 0 ? (
                              <ObjectiveStatus
                                status={"no"}
                                style={{ height: iconHeight }}
                                msg={<></>}
                              />
                            ) : (
                              <ObjectiveStatus
                                status={"yes"}
                                style={{
                                  color:
                                    statusColor[
                                      (metric.extra!.services as Services)[
                                        "cognitive"
                                      ]
                                    ],
                                  height: iconHeight,
                                }}
                                msg={<></>}
                              />
                            )}
                          </td>
                          <td>
                            {(metric.extra!.services as Services)["leisure"] ===
                            0 ? (
                              <ObjectiveStatus
                                status={"no"}
                                style={{ height: iconHeight }}
                                msg={<></>}
                              />
                            ) : (
                              <ObjectiveStatus
                                status={"yes"}
                                style={{
                                  color:
                                    statusColor[
                                      (metric.extra!.services as Services)[
                                        "leisure"
                                      ]
                                    ],
                                  height: iconHeight,
                                }}
                                msg={<></>}
                              />
                            )}
                          </td>
                          <td>
                            {(metric.extra!.services as Services)[
                              "feel_good"
                            ] === 0 ? (
                              <ObjectiveStatus
                                status={"no"}
                                style={{ height: iconHeight }}
                                msg={<></>}
                              />
                            ) : (
                              <ObjectiveStatus
                                status={"yes"}
                                style={{
                                  color:
                                    statusColor[
                                      (metric.extra!.services as Services)[
                                        "feel_good"
                                      ]
                                    ],
                                  height: iconHeight,
                                }}
                                msg={<></>}
                              />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Translator>
              <VerticalSpacer />
              <div style={{ textAlign: "right", fontSize: 13 }}>
                <Button onClick={handlePrevPage} disabled={currentPage === 1}>
                  ◀
                </Button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  ▶
                </Button>
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
                    This report summarizes overlap with benthic habitats and the
                    ecosystem services provided by the overlapped habitats.
                    Ecosystem service presence is denoted as follows:
                    <VerticalSpacer height={10} />
                    <p>
                      <img
                        src={greenCheck}
                        style={{
                          maxWidth: "25px",
                          verticalAlign: "top",
                        }}
                      />{" "}
                      Habitat is overlapped and provides the service with
                      <br />
                      <span style={{ marginLeft: "30px" }}>
                        a "high" rating
                      </span>
                    </p>
                    <VerticalSpacer height={3} />
                    <p>
                      <img
                        src={yellowCheck}
                        style={{ maxWidth: "25px", verticalAlign: "top" }}
                      />{" "}
                      Habitat is overlapped and provides the service with
                      <br />
                      <span style={{ marginLeft: "30px" }}>a "low" rating</span>
                    </p>
                    <VerticalSpacer height={3} />
                    <p>
                      <img
                        src={redX}
                        style={{ maxWidth: "25px", verticalAlign: "top" }}
                      />{" "}
                      Service is not provided by the habitat or the habitat is
                      <br />
                      <span style={{ marginLeft: "30px" }}>
                        not included in plan
                      </span>
                    </p>
                  </p>
                  <VerticalSpacer height={3} />
                  <p>
                    Benthic habitat data were provided by EUNIS (European
                    University Information Systems organisation), and the
                    ecosystem service values were retrieved from{" "}
                    <a href="https://doi.org/10.3389/fmars.2014.00023">
                      <i>
                        Mapping ecosystem services provided by benthic habitats
                        in the European North Atlantic Ocean
                      </i>
                    </a>{" "}
                    (Galparsoro et al., 2014).
                  </p>
                  <VerticalSpacer height={10} />
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
