/**
 * @jest-environment node
 * @group smoke
 */
import { oilAreasOverlap } from "./oilAreasOverlap";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof oilAreasOverlap).toBe("function");
  });
  test("oilAreasOverlapSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await oilAreasOverlap(example);
      expect(result).toBeTruthy();
      writeResultOutput(
        result,
        "oilAreasOverlap",
        example.properties.name
      );
    }
  }, 120000);
});
