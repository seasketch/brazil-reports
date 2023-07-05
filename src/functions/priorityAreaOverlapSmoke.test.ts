/**
 * @jest-environment node
 * @group smoke
 */
import { priorityAreaOverlap } from "./priorityAreaOverlap";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof priorityAreaOverlap).toBe("function");
  });
  test("priorityAreaOverlapSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await priorityAreaOverlap(example);
      expect(result).toBeTruthy();
      writeResultOutput(result, "priorityAreaOverlap", example.properties.name);
    }
  }, 120000);
});
