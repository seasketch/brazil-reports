import React from "react";
import { SizeCard } from "./SizeCard";
import { SketchAttributesCard } from "@seasketch/geoprocessing/client-ui";
import { MiningCard } from "./MiningCard";
import { WindCard } from "./WindCard";
import { OilCard } from "./OilCard";
import { OilPlatformCard } from "./OilPlatformCard";
import { FishingIntensityCard } from "./FishingIntensityCard";
import { MarineTrafficCard } from "./MarineTrafficCard";

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
      <MarineTrafficCard />
    </>
  );
};

export default ReportPage;
