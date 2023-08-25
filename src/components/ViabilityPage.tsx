import React from "react";
import { SizeCard } from "./SizeCard";
import { SketchAttributesCard } from "@seasketch/geoprocessing/client-ui";
import { FishingEffortCard } from "./FishingEffortCard";
import { MiningCard } from "./MiningCard";
import { ShippingCard } from "./ShippingCard";
import { OilCard } from "./OilCard";

const ReportPage = () => {
  return (
    <>
      <SizeCard />
      {/* <SketchAttributesCard autoHide /> */}
      <FishingEffortCard />
      <MiningCard />
      <ShippingCard />
      <OilCard />
    </>
  );
};

export default ReportPage;
