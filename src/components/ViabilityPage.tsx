import React from "react";
import { SizeCard } from "./SizeCard.js";
import { SketchAttributesCard } from "@seasketch/geoprocessing/client-ui";
import { MiningCard } from "./MiningCard.js";
import { WindCard } from "./WindCard.js";
import { OilCard } from "./OilCard.js";
import { OilPlatformCard } from "./OilPlatformCard.js";
import { FishingIntensityCard } from "./FishingIntensityCard.js";
import { ShippingIntensityCard } from "./ShippingIntensityCard.js";

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
