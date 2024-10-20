import {
  PreprocessingHandler,
  genPreprocessor,
} from "@seasketch/geoprocessing";
import project from "../../project/projectClient.js";
import { genClipLoader } from "@seasketch/geoprocessing/dataproviders";

const clipLoader = genClipLoader(project, [
  {
    datasourceId: "brazil_eez",
    operation: "intersection",
    options: {},
  },
]);

export const clipToOceanEez = genPreprocessor(clipLoader);

export default new PreprocessingHandler(clipToOceanEez, {
  title: "clipToOceanEez",
  description: "Example-description",
  timeout: 40,
  requiresProperties: [],
  memory: 4096,
});
