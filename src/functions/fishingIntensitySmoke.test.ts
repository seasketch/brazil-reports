/**
 * @jest-environment node
 * @group smoke
 */
import { fishingIntensity } from "./fishingIntensity.js";
import { describe, test, expect } from "vitest";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof fishingIntensity).toBe("function");
  });
  test("fishingIntensitySmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await fishingIntensity(example);
      expect(result).toBeTruthy();
      writeResultOutput(result, "fishingIntensity", example.properties.name);
    }
  }, 120000);
});
