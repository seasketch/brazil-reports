import { importDatasource } from "@seasketch/geoprocessing/scripts";
import project from "../project/projectClient";
import {
  ImportVectorDatasourceOptions,
  importVectorDatasourceOptionsSchema
} from "@seasketch/geoprocessing";

interface ImportVectorDatasourceAnswers
  extends Pick<
    ImportVectorDatasourceOptions,
    "src" | "datasourceId" | "layerName" | "geo_type" | "formats"
  > {
  classKeys: string;
  propertiesToKeep: string;
}

function vectorMapper(
  answers: ImportVectorDatasourceAnswers
): ImportVectorDatasourceOptions {
  const options: ImportVectorDatasourceOptions = {
    ...answers,
    classKeys: answers.classKeys.length > 0 ? answers.classKeys.split(",") : [],
    propertiesToKeep:
      answers.propertiesToKeep.length > 0
        ? answers.propertiesToKeep.split(",")
        : [],
  };

  const validOptions = importVectorDatasourceOptionsSchema.parse(options);
  return validOptions;
}

const vectorMapperInputs: ImportVectorDatasourceAnswers[] = [
  {
    geo_type: "vector",
    src: "/workspaces/brazil-reports/data/src/fromDatabase/human.mining_active_anm.json",
    layerName: "",
    classKeys: "",
    propertiesToKeep: "",
    formats: ["fgb"],
    datasourceId: "mining_active_test"
  },
  {
    geo_type: "vector",
    src: "/workspaces/brazil-reports/data/src/fromDatabase/human.mining_potential_dnpm.json",
    layerName: "",
    classKeys: "",
    propertiesToKeep: "",
    formats: ["fgb"],
    datasourceId: "mining_potential_test"
  }
]

for (let i = 0; i < vectorMapperInputs.length; i++) {

  const config = vectorMapper(vectorMapperInputs[i]);

  // @ts-ignore
  importDatasource(project, config, {
    doPublish: false,
    srcBucketUrl: project.dataBucketUrl(),
  });

}