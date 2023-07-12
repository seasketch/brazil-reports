/**
 * @jest-environment node
 * @group smoke
 */
import { ecozonesBenthicOverlap } from "./ecozonesBenthicOverlap";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof ecozonesBenthicOverlap).toBe("function");
  });
  test("ecozonesBenthicOverlapSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await ecozonesBenthicOverlap(example);
      expect(result).toBeTruthy();
      writeResultOutput(
        result,
        "ecozonesBenthicOverlap",
        example.properties.name
      );
    }
  }, 120000);
});
