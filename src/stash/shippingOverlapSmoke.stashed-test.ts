/**
 * @jest-environment node
 * @group smoke
 */
import { shippingOverlap } from "./shippingOverlap";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof shippingOverlap).toBe("function");
  });
  test("shippingOverlapSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await shippingOverlap(example);
      expect(result).toBeTruthy();
      writeResultOutput(result, "shippingOverlap", example.properties.name);
    }
  }, 120000);
});
