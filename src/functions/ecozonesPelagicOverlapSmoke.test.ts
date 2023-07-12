/**
 * @jest-environment node
 * @group smoke
 */
import { ecozonesPelagicOverlap } from "./ecozonesPelagicOverlap";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof ecozonesPelagicOverlap).toBe("function");
  });
  test("ecozonesPelagicOverlapSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await ecozonesPelagicOverlap(example);
      expect(result).toBeTruthy();
      writeResultOutput(
        result,
        "ecozonesPelagicOverlap",
        example.properties.name
      );
    }
  }, 120000);
});
