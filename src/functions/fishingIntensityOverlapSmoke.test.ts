/**
 * @jest-environment node
 * @group smoke
 */
import { fishingIntensityOverlap } from "./fishingIntensityOverlap";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof fishingIntensityOverlap).toBe("function");
  });
  test("fishingIntensityOverlapSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await fishingIntensityOverlap(example);
      expect(result).toBeTruthy();
      writeResultOutput(
        result,
        "fishingIntensityOverlap",
        example.properties.name
      );
    }
  }, 120000);
});
