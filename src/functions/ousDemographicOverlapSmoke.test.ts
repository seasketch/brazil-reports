import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";
import { describe, test, expect } from "vitest";
import { ousDemographics } from "./ousDemographics.js";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof ousDemographics).toBe("function");
  });
  test("ousDemographics - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await ousDemographics(example);
      expect(result).toBeTruthy();
      writeResultOutput(result, "ousDemographics", example.properties.name);
    }
  }, 60000);
});
