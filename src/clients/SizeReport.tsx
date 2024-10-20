import React from "react";
import Translator from "../components/TranslatorAsync.js";
import { SizeCard } from "../components/SizeCard.js";

export const SizeReport = () => {
  return (
    <Translator>
      <SizeCard />
    </Translator>
  );
};

// Default export lazy-loaded by top-level ReportApp
export default SizeReport;
