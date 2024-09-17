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
  InfoStatus,
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

const metricGroup = project.getMetricGroup("habitatsServices");
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
        functionName="habitatsServices"
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
                  .hrkJmp .icon {
                    padding-right: 0px;
                  }
                  .services-table {
                    font-size: 12px;
                  }

                  .services-table th, .services-table td {
                    min-width: 87px;
                    text-align: center;
                    background-color: white;
                    height: 20px;
                  }

                  .services-table th:nth-child(1) {
                    font-size: 13px;
                    width: 120px;
                    position: absolute;
                    bgcolor: white;
                    padding-top: 8px;
                    padding-bottom: 22px;
                    margin-left: -5px;
                    padding-right: 5px;
                    border-right: 1px solid #525252;
                    border-collapse: collapse;
                  }

                  .services-table td:nth-child(1) {
                    font-size: 13px;
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
                        <th>{t("Raw Material")}</th>
                        <th>{"Climate Regulation"}</th>
                        <th>{t("Natural Hazard Prevention")}</th>
                        <th>{t("Primary Production")}</th>
                        <th>{t("Nutrient Cycling")}</th>
                        <th>{t("Nursery")}</th>
                        <th>{t("Maintenance of Biodiversity")}</th>
                        <th>{t("Water Quality Regulation")}</th>
                        <th>{t("Cognitive Value")}</th>
                        <th>{t("Recreation")}</th>
                        <th>{t("Human Well-Being")}</th>
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
              <div
                style={{
                  display: "inline-flex",
                  width: "310px",
                }}
              >
                <Translator>
                  <InfoStatus
                    msg={
                      <p style={{ marginTop: 0, fontSize: 13 }}>
                        {t(
                          "Scroll right to view additional ecosystem services"
                        )}
                        <VerticalSpacer height={6} />
                        {t(
                          "Use the arrows to the right to view additional benthic habitat types"
                        )}
                      </p>
                    }
                    size={15}
                    style={{ paddingTop: "15px", color: "#9ECFE6" }}
                  />
                </Translator>
              </div>
              <div
                style={{
                  float: "right",
                  fontSize: 13,
                }}
              >
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

              <Trans i18nKey="Services table headers key">
                <style>
                  {`
                    ul {
                      padding-left: 25px;
                    }

                    li {
                      font-size: 14px;
                      color: #444444;
                      padding-bottom: 8px;
                    }

                    b {
                      color: black;
                    }

                    h3 {
                      font-size: 15px;
                      padding-bottom: 0px;
                      padding-left: 15px;
                    }
                  `}
                </style>
                <h3>Ecosystem Service Descriptions</h3>
                <ul>
                  <li>
                    <b>Food</b>: food provision
                  </li>
                  <li>
                    <b>Raw Material</b>: raw materials (biological — including
                    biochemical, medicinal, and ornamental)
                  </li>
                  <li>
                    <b>Climate Regulation</b>: air quality and climate
                    regulation
                  </li>
                  <li>
                    <b>Natural Hazard Prevention</b>: disturbance and natural
                    hazard prevention
                  </li>
                  <li>
                    <b>Primary Production</b>: photosynthesis, chemosynthesis,
                    and primary production
                  </li>
                  <li>
                    <b>Nutrient Cycling</b>: nutrient cycling
                  </li>
                  <li>
                    <b>Nursery</b>: reproduction and nursery
                  </li>
                  <li>
                    <b>Maintenance Of Biodiversity</b>: maintenance of
                    biodiversity
                  </li>
                  <li>
                    <b>Water Quality Regulation</b>: water quality regulation
                    and bioremediation of waste
                  </li>
                  <li>
                    <b>Cognitive Value</b>: cognitive value
                  </li>
                  <li>
                    <b>Recreation</b>: leisure, recreation, and cultural
                    inspiration
                  </li>
                  <li>
                    <b>Human Well Being</b>: feel good or warm glow
                  </li>
                </ul>
              </Trans>

              {isCollection && (
                <Collapse title={t("Show by MPA")}>
                  {genSketchTable(data)}
                </Collapse>
              )}

              <Collapse title={t("Learn more")}>
                <Trans i18nKey="Habitats Services Card - learn more">
                  <div style={{ fontSize: "15px" }}>
                    <p>
                      {" "}
                      This report summarizes overlap with benthic habitats and
                      the ecosystem services provided by the overlapped
                      habitats. Ecosystem service presence is denoted as
                      follows:
                      <VerticalSpacer height={15} />
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          paddingRight: "10px",
                        }}
                      >
                        <img
                          src={greenCheck}
                          style={{
                            width: "25px",
                            height: "25px",
                            paddingRight: "10px",
                          }}
                        />
                        Habitat is overlapped and provides the service with a
                        "high" rating
                      </div>
                      <VerticalSpacer height={10} />
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          paddingRight: "10px",
                        }}
                      >
                        <img
                          src={yellowCheck}
                          style={{
                            width: "25px",
                            height: "25px",
                            paddingRight: "10px",
                          }}
                        />
                        Habitat is overlapped and provides the service with a
                        "low" rating
                      </div>
                      <VerticalSpacer height={10} />
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          paddingRight: "10px",
                        }}
                      >
                        <img
                          src={redX}
                          style={{
                            width: "25px",
                            height: "25px",
                            paddingRight: "10px",
                          }}
                        />
                        Service is not provided by the habitat or the habitat is
                        not included in plan
                      </div>
                    </p>
                    <VerticalSpacer height={3} />
                    <p>
                      Benthic habitat data were provided by EUNIS (European
                      University Information Systems organisation), and the
                      ecosystem service values were retrieved from{" "}
                      <a
                        href="https://doi.org/10.3389/fmars.2014.00023"
                        target="_blank"
                      >
                        <i>
                          Mapping ecosystem services provided by benthic
                          habitats in the European North Atlantic Ocean
                        </i>
                      </a>{" "}
                      (Galparsoro et al., 2014).
                    </p>
                    <VerticalSpacer height={10} />
                    <p>
                      An explanation and examples (columns Q, R, and S) for each
                      category of ecosystem services can be found in this
                      adaptation of the Common International Classification of
                      Ecosystem Services (CICES) V5.2v{" "}
                      <a
                        href="https://ucsbconnect-my.sharepoint.com/:x:/g/personal/petermenzies_ucsb_edu/EbMmmKPyU5VFuaauU8Za2Q0B9diY7ZJYWExUHzpi6N0E6w?e=MVVDzK"
                        target="_blank"
                      >
                        spreadsheet
                      </a>
                      .
                    </p>
                    <VerticalSpacer height={10} />
                    <p>
                      If zone boundaries overlap with each other, the overlap is
                      only counted once.
                    </p>
                  </div>
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
