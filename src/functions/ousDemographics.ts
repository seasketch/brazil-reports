import {
  Sketch,
  GeoprocessingHandler,
  Polygon,
  MultiPolygon,
  SketchCollection,
  genFeatureCollection,
  Nullable,
  Feature,
  FeatureCollection,
  toSketchArray,
  clip,
  createMetric,
} from "@seasketch/geoprocessing";
import { Metric } from "@seasketch/geoprocessing/client-core";
import projectClient from "../../project/projectClient.js";
import { bbox, booleanIntersects } from "@turf/turf";
import { fgbFetchAll } from "@seasketch/geoprocessing/dataproviders";

export interface OusFeatureProperties {
  resp_id: number;
  sector?: Nullable<string>;
  state?: Nullable<string>;
  city?: Nullable<string>;
  gear?: Nullable<string>;
  number_of_ppl: string | number;
}

export type OusFeature = Feature<MultiPolygon | Polygon, OusFeatureProperties>;
export type OusFeatureCollection = FeatureCollection<
  MultiPolygon | Polygon,
  OusFeatureProperties
>;

export type ClassCountStats = Record<string, number>;

export interface OusStats {
  people: number;
  bySector: ClassCountStats;
  bystate: ClassCountStats;
  byGear: ClassCountStats;
  byCity: ClassCountStats;
}

export type OusReportResult = {
  stats: OusStats;
  metrics: Metric[];
};

/** Calculate sketch area overlap inside and outside of multiple planning area boundaries */
export async function ousDemographics(
  sketch:
    | Sketch<Polygon | MultiPolygon>
    | SketchCollection<Polygon | MultiPolygon>,
) {
  const url = `${projectClient.dataBucketUrl()}ous_demographics.fgb`;

  const rawShapes = (await fgbFetchAll<Feature<Polygon | MultiPolygon>>(
    url,
    sketch.bbox || bbox(sketch),
  )) as OusFeature[];

  const shapes = genFeatureCollection(rawShapes) as OusFeatureCollection;

  const combinedSketch = (() => {
    const sketches = toSketchArray(
      sketch as
        | Sketch<Polygon | MultiPolygon>
        | SketchCollection<Polygon | MultiPolygon>,
    );
    const sketchColl = genFeatureCollection(sketches);
    return sketch ? clip(sketchColl, "union") : null;
  })();

  // Tracking which respondents have been processed
  const respondentProcessed: Record<string, Record<string, boolean>> = {};
  // Track current number of people represented by each respondent
  const pplPerRespondent: Record<string, number> = {};

  // Process OUS shapes
  const countStats = shapes.features.reduce<OusStats>(
    (statsSoFar: OusStats, shape: OusFeature) => {
      // Skip and log malformed OUS shapes
      if (
        !shape.properties ||
        !shape.properties.resp_id ||
        shape.properties.number_of_ppl == null
      ) {
        console.log(`Malformed shape: ${JSON.stringify(shape)}`);
        return statsSoFar;
      }

      // Skip OUS shapes that do not overlap with the sketch
      if (combinedSketch && !booleanIntersects(shape, combinedSketch))
        return statsSoFar;

      // Extract properties from OUS shape
      // resp_id and state are consistent across a respondent's shapes
      // curPeople, curSector, and curGears are consistent within a sector per respondent, but not across sectors
      const resp_id = shape.properties.resp_id;
      const state: string = shape.properties.state
        ? shape.properties.state
        : "unknown-state";
      const curPpl = Number(shape.properties.number_of_ppl);
      const curSector: string = shape.properties.sector
        ? shape.properties.sector
        : "unknown-sector";
      const city: string = shape.properties.city
        ? shape.properties.city
        : "unknown-city";
      const curGears: string[] = shape.properties.gear
        ? shape.properties.gear.split(",").map((s: string) => s.trim())
        : ["unknown-gear"];

      // Updated stats object
      let newStats: OusStats = { ...statsSoFar };

      // If new respondent
      if (!respondentProcessed[resp_id]) {
        // Add respondent to total respondents
        newStats.people = newStats.people + curPpl;

        // Add new respondent to municipality stats
        newStats.bystate[state] = newStats.bystate[state]
          ? newStats.bystate[state] + curPpl
          : curPpl;

        // Add new respondent to city stats
        newStats.byCity[city] = newStats.byCity[city]
          ? newStats.byCity[city] + curPpl
          : curPpl;

        // Respondent processed
        respondentProcessed[resp_id] = {};

        // Keep track of # people this respondent is currently representing
        respondentProcessed[resp_id][curPpl] = true;
        pplPerRespondent[resp_id] = curPpl;
      }

      // Count sectors once per respondent (# ppl is consistent within sector per respondent)
      if (!respondentProcessed[resp_id][curSector]) {
        newStats.bySector[curSector] = newStats.bySector[curSector]
          ? newStats.bySector[curSector] + curPpl
          : curPpl;
        respondentProcessed[resp_id][curSector] = true;
      }

      // Count gear types once per respondent (# ppl is consistent within fishing sector per respondent)
      curGears.forEach((curGear) => {
        if (!respondentProcessed[resp_id][curGear]) {
          newStats.byGear[curGear] = newStats.byGear[curGear]
            ? newStats.byGear[curGear] + curPpl
            : curPpl;
          respondentProcessed[resp_id][curGear] = true;
        }
      });

      return newStats;
    },
    {
      people: 0,
      bySector: {},
      bystate: {},
      byGear: {},
      byCity: {},
    },
  );

  const overallMetric = createMetric({
    metricId: "ousPeopleCount",
    classId: "ousPeopleCount_all",
    value: countStats.people,
    ...(sketch ? { sketchId: sketch.properties.id } : {}),
  });
  const sectorMetrics = genOusClassMetrics(countStats.bySector, sketch);
  const stateMetrics = genOusClassMetrics(countStats.bystate, sketch);
  const gearMetrics = genOusClassMetrics(countStats.byGear, sketch);
  const cityMetrics = genOusClassMetrics(countStats.byCity, sketch);

  const finalMetrics = [
    overallMetric,
    ...sectorMetrics,
    ...stateMetrics,
    ...gearMetrics,
    ...cityMetrics,
  ];

  return finalMetrics;
}

/** Generate metrics from OUS class stats */
export function genOusClassMetrics(
  classStats: ClassCountStats,
  sketch?:
    | Sketch<Polygon | MultiPolygon>
    | SketchCollection<Polygon | MultiPolygon>,
): Metric[] {
  return Object.keys(classStats)
    .map((curClass) => [
      createMetric({
        metricId: "ousPeopleCount",
        classId: curClass,
        value: classStats[curClass],
        ...(sketch ? { sketchId: sketch.properties.id } : {}),
      }),
    ])
    .reduce<Metric[]>((soFar, classMetrics) => soFar.concat(classMetrics), []);
}

export default new GeoprocessingHandler(ousDemographics, {
  title: "ousDemographics",
  description: "Calculates ous overlap metrics",
  timeout: 900,
  executionMode: "async",
  memory: 10240,
  requiresProperties: [],
});
