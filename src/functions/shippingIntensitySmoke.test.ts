/**
 * @jest-environment node
 * @group smoke
 */
import { shippingIntensity } from "./shippingIntensity.js";
import { describe, test, expect } from "vitest";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof shippingIntensity).toBe("function");
  });
  test("shippingIntensitySmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await shippingIntensity(example);
      expect(result).toBeTruthy();
      writeResultOutput(result, "shippingIntensity", example.properties.name);
    }
  }, 120000);
});
