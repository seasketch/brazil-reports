import React from "react";
import { SizeCard } from "./SizeCard";
import { SketchAttributesCard } from "@seasketch/geoprocessing/client-ui";
import { TrawlingCard } from "./TrawlingCard";

const ReportPage = () => {
  return (
    <>
      <SizeCard />
      <SketchAttributesCard autoHide />
      <TrawlingCard />
    </>
  );
};

export default ReportPage;
