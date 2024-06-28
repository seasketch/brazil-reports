import React from "react";
// import { GeomorphicCard } from "./GeomorphicCard";
import { PriorityAreaCard } from "./PriorityAreaCard.js";
import { BathyClassesCard } from "./BathyClassesCard.js";
import { HabitatsServicesCard } from "./HabitatsServicesCard.js";

const ReportPage = () => {
  return (
    <>
      {/* <GeomorphicCard /> */}
      <PriorityAreaCard />
      <BathyClassesCard />
      <HabitatsServicesCard />
    </>
  );
};

export default ReportPage;
