import React from "react";
import { SizeCard } from "./SizeCard";
import { SketchAttributesCard } from "@seasketch/geoprocessing/client-ui";
import { MiningCard } from "./MiningCard";
import { WindCard } from "./WindCard";
import { OilCard } from "./OilCard";
import { OilPlatformCard } from "./OilPlatformCard";
import { FishingIntensityCard } from "./FishingIntensityCard";
import { ShippingIntensityCard } from "./ShippingIntensityCard";

const ReportPage = () => {
  return (
    <>
      <SizeCard />
      {/* <SketchAttributesCard autoHide /> */}
      <FishingIntensityCard />
      <MiningCard />
      <WindCard />
      <OilCard />
      <OilPlatformCard />
      <ShippingIntensityCard />
    </>
  );
};

export default ReportPage;
