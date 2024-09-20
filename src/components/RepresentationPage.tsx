import React from "react";
// import { GeomorphicCard } from "./GeomorphicCard";
import { PriorityAreasCard } from "./PriorityAreasCard.js";
import { BathyClassesCard } from "./BathyClassesCard.js";
import { HabitatsServicesCard } from "./HabitatsServicesCard.js";

const ReportPage = () => {
  return (
    <>
      {/* <GeomorphicCard /> */}
      <PriorityAreasCard />
      <BathyClassesCard />
      <HabitatsServicesCard />
    </>
  );
};

export default ReportPage;
