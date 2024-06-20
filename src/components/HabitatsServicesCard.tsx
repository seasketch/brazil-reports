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
  ObjectiveStatus,
  VerticalSpacer,
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
                    min-width: 80px;
                    padding-left: 120px;
                  }
                  .container {
                    justify-content: center;
                  }
                `}
              </style>
              <div style={{ overflowX: "auto" }}>
                <table className="services-table">
                  <thead>
                    <tr>
                      <th>Habitat</th>
                      <th>Area</th>
                      <th>Food</th>
                      <th>Raw</th>
                      <th>Air</th>
                      <th>Disturb- ance</th>
                      <th>Photo- synthesis</th>
                      <th>Nutrient</th>
                      <th>Repro- duction</th>
                      <th>Bio- diversity</th>
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
                                    (metric.extra!.services as Services)["food"]
                                  ],
                                height: iconHeight,
                              }}
                              msg={<></>}
                            />
                          )}
                        </td>
                        <td>
                          {(metric.extra!.services as Services)["raw"] === 0 ? (
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
                                    (metric.extra!.services as Services)["raw"]
                                  ],
                                height: iconHeight,
                              }}
                              msg={<></>}
                            />
                          )}
                        </td>
                        <td>
                          {(metric.extra!.services as Services)["air"] === 0 ? (
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
                                    (metric.extra!.services as Services)["air"]
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
                          {(metric.extra!.services as Services)["nutrient"] ===
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
                          {(metric.extra!.services as Services)["cognitive"] ===
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
                          {(metric.extra!.services as Services)["feel_good"] ===
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
