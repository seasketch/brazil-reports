import React from "react";
// import { GeomorphicCard } from "./GeomorphicCard";
import { PriorityAreaCard } from "./PriorityAreaCard";
import { EcozonesPelagicCard } from "./EcozonesPelagicCard";
import { EcozonesBenthicCard } from "./EcozonesBenthicCard";

const ReportPage = () => {
  return (
    <>
      {/* <GeomorphicCard /> */}
      <PriorityAreaCard />
      <EcozonesPelagicCard />
      <EcozonesBenthicCard />
    </>
  );
};

export default ReportPage;
