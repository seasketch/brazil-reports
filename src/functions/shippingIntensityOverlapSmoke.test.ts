/**
 * @jest-environment node
 * @group smoke
 */
import { shippingIntensityOverlap } from "./shippingIntensityOverlap.js";
import { describe, test, expect } from "vitest";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof shippingIntensityOverlap).toBe("function");
  });
  test("shippingIntensityOverlapSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await shippingIntensityOverlap(example);
      expect(result).toBeTruthy();
      writeResultOutput(
        result,
        "shippingIntensityOverlap",
        example.properties.name
      );
    }
  }, 120000);
});
