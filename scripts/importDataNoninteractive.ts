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
    src: "data/src/fromDatabase/usos_humanos.eolico_parques.json",
    layerName: "eolico_parques",
    classKeys: "",
    propertiesToKeep: "",
    formats: ["fgb"],
    datasourceId: "wind_farms"
  },
  {
    geo_type: "vector",
    src: "data/src/fromDatabase/usos_humanos.eolico_torres.json",
    layerName: "eolico_torres",
    classKeys: "",
    propertiesToKeep: "",
    formats: ["fgb"],
    datasourceId: "wind_towers"
  },
  {
    geo_type: "vector",
    src: "data/src/fromDatabase/usos_humanos.eolico_linhas_transmissao.json",
    layerName: "eolico_linhas_transmissao",
    classKeys: "",
    propertiesToKeep: "",
    formats: ["fgb"],
    datasourceId: "power_lines"
  },
  {
    geo_type: "vector",
    src: "data/src/fromDatabase/public.batimetria_classes.json",
    layerName: "batimetria_classes",
    classKeys: "class",
    propertiesToKeep: "",
    formats: ["fgb"],
    datasourceId: "bathymetric_classes"
  },
  {
    geo_type: "vector",
    src: "data/src/fromDatabase/usos_humanos.mineracao_areas_potenciais.json",
    layerName: "mineracao_areas_potenciais",
    classKeys: "",
    propertiesToKeep: "",
    formats: ["fgb"],
    datasourceId: "mining_potential"
  },
  {
    geo_type: "vector",
    src: "data/src/fromDatabase/usos_humanos.mineracao_processos.json",
    layerName: "mineracao_processos",
    classKeys: "",
    propertiesToKeep: "",
    formats: ["fgb"],
    datasourceId: "mining_process"
  },
  {
    geo_type: "vector",
    src: "data/src/fromDatabase/usos_humanos.petroleo_blocos_concessao.json",
    layerName: "petroleo_blocos_concessao",
    classKeys: "",
    propertiesToKeep: "",
    formats: ["fgb"],
    datasourceId: "oil_blocks_concession"
  },
  {
    geo_type: "vector",
    src: "data/src/fromDatabase/usos_humanos.petroleo_campos_producao.json",
    layerName: "petroleo_campos_producao",
    classKeys: "",
    propertiesToKeep: "",
    formats: ["fgb"],
    datasourceId: "oil_production_fields"
  },
  {
    geo_type: "vector",
    src: "data/src/fromDatabase/usos_humanos.petroleo_campos_producao.json",
    layerName: "petroleo_campos_producao",
    classKeys: "",
    propertiesToKeep: "",
    formats: ["fgb"],
    datasourceId: "oil_production_fields"
  },
  {
    geo_type: "vector",
    src: "data/src/fromDatabase/usos_humanos.petroleo_plataformas.json",
    layerName: "petroleo_plataformas",
    classKeys: "",
    propertiesToKeep: "",
    formats: ["fgb"],
    datasourceId: "oil_platforms"
  },
  {
    geo_type: "vector",
    src: "data/src/fromDatabase/usos_humanos.portos.json",
    layerName: "portos",
    classKeys: "",
    propertiesToKeep: "",
    formats: ["fgb"],
    datasourceId: "ports"
  },
  {
    geo_type: "vector",
    src: "data/src/fromDatabase/usos_humanos.portos.json",
    layerName: "portos",
    classKeys: "",
    propertiesToKeep: "",
    formats: ["fgb"],
    datasourceId: "ports"
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