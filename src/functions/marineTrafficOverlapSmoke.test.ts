/**
 * @jest-environment node
 * @group smoke
 */
import { marineTrafficOverlap } from "./marineTrafficOverlap";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof marineTrafficOverlap).toBe("function");
  });
  test("marineTrafficOverlapSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await marineTrafficOverlap(example);
      expect(result).toBeTruthy();
      writeResultOutput(result, "marineTrafficOverlap", example.properties.name);
    }
  }, 120000);
});
