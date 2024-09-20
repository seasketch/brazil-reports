/**
 * @jest-environment node
 * @group smoke
 */
import { bathyClasses } from "./bathyClasses.js";
import { describe, test, expect } from "vitest";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof bathyClasses).toBe("function");
  });
  test("bathyClassesSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await bathyClasses(example);
      expect(result).toBeTruthy();
      writeResultOutput(result, "bathyClasses", example.properties.name);
    }
  }, 400000);
});
