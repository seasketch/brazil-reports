/**
 * @jest-environment node
 * @group smoke
 */
import { geomorphicOverlap } from "./geomorphicOverlap";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof geomorphicOverlap).toBe("function");
  });
  test("geomorphicOverlapSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await geomorphicOverlap(example);
      expect(result).toBeTruthy();
      writeResultOutput(result, "geomorphicOverlap", example.properties.name);
    }
  }, 120000);
});
