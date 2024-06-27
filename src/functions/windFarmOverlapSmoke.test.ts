/**
 * @jest-environment node
 * @group smoke
 */
import { windFarmOverlap } from "./windFarmOverlap.js";
import { describe, test, expect } from "vitest";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof windFarmOverlap).toBe("function");
  });
  test("windFarmOverlapSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await windFarmOverlap(example);
      expect(result).toBeTruthy();
      writeResultOutput(result, "windFarmOverlap", example.properties.name);
    }
  }, 120000);
});
