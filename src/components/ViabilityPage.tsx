import React from "react";
import { SizeCard } from "./SizeCard";
import { SketchAttributesCard } from "@seasketch/geoprocessing/client-ui";
import { MiningCard } from "./MiningCard";
import { WindCard } from "./WindCard";
import { OilCard } from "./OilCard";

const ReportPage = () => {
  return (
    <>
      <SizeCard />
      {/* <SketchAttributesCard autoHide /> */}
      <MiningCard />
      <WindCard />
      <OilCard />
    </>
  );
};

export default ReportPage;
