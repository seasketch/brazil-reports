/**
 * @jest-environment node
 * @group smoke
 */
import { powerLinesOverlap } from "./powerLinesOverlap";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof powerLinesOverlap).toBe("function");
  });
  test("powerLinesOverlapSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await powerLinesOverlap(example);
      expect(result).toBeTruthy();
      writeResultOutput(
        result,
        "powerLinesOverlap",
        example.properties.name
      );
    }
  }, 120000);
});
