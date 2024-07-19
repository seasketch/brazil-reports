/**
 * @jest-environment node
 * @group smoke
 */
import { oilPlatformOverlap } from "./oilPlatformOverlap.js";
import { describe, test, expect } from "vitest";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof oilPlatformOverlap).toBe("function");
  });
  test("oilPlatformOverlapSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await oilPlatformOverlap(example);
      expect(result).toBeTruthy();
      writeResultOutput(result, "oilPlatformOverlap", example.properties.name);
    }
  }, 120000);
});
