/**
 * @jest-environment node
 * @group smoke
 */
import { priorityAreas } from "./priorityAreas.js";
import { describe, test, expect } from "vitest";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof priorityAreas).toBe("function");
  });
  test("priorityAreasSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await priorityAreas(example);
      expect(result).toBeTruthy();
      writeResultOutput(result, "priorityAreas", example.properties.name);
    }
  }, 120000);
});
