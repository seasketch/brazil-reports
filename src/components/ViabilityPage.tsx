import React from "react";
import { SizeCard } from "./SizeCard";
import { SketchAttributesCard } from "@seasketch/geoprocessing/client-ui";
import { FishingEffortCard } from "./FishingEffortCard";

const ReportPage = () => {
  return (
    <>
      <SizeCard />
      {/* <SketchAttributesCard autoHide /> */}
      <FishingEffortCard />
    </>
  );
};

export default ReportPage;
