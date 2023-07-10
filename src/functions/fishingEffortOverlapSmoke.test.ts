/**
 * @jest-environment node
 * @group smoke
 */
import { fishingEffortOverlap } from "./fishingEffortOverlap";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof fishingEffortOverlap).toBe("function");
  });
  test("fishingEffortOverlapSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await fishingEffortOverlap(example);
      expect(result).toBeTruthy();
      writeResultOutput(
        result,
        "fishingEffortOverlap",
        example.properties.name
      );
    }
  }, 120000);
});
