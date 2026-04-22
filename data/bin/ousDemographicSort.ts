import fs from "fs-extra";
import {
  FeatureCollection,
  Nullable,
  Polygon,
} from "@seasketch/geoprocessing/client-core";

interface OusFeatureProperties {
  resp_id: number;
  state?: Nullable<string>;
  sector?: Nullable<string>;
  gear?: Nullable<string>;
  number_of_ppl: string | number;
  [key: string]: any;
}

const shapeFc = fs.readJSONSync(
  "../src/Analytics/OUS/ous_demographics.geojson",
) as FeatureCollection<Polygon, OusFeatureProperties>;

// sort by respondent_id (string)
const sortedShapes = shapeFc.features.sort(
  (a, b) => a.properties.resp_id - b.properties.resp_id,
);
fs.writeFileSync(
  "../src/Analytics/OUS/ous_demographics_sorted.geojson",
  JSON.stringify({ ...shapeFc, features: sortedShapes }),
);
