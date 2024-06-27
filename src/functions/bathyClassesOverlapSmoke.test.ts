/**
 * @jest-environment node
 * @group smoke
 */
import { bathyClassesOverlap } from "./bathyClassesOverlap.js";
import { describe, test, expect } from "vitest";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof bathyClassesOverlap).toBe("function");
  });
  test("bathyClassesOverlapSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await bathyClassesOverlap(example);
      expect(result).toBeTruthy();
      writeResultOutput(result, "bathyClassesOverlap", example.properties.name);
    }
  }, 400000);
});
