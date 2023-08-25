/**
 * @jest-environment node
 * @group smoke
 */
import { windTowerOverlap } from "./windTowerOverlap";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof windTowerOverlap).toBe("function");
  });
  test("windTowerOverlapSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await windTowerOverlap(example);
      expect(result).toBeTruthy();
      writeResultOutput(result, "windTowerOverlap", example.properties.name);
    }
  }, 120000);
});
