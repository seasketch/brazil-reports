/**
 * @jest-environment node
 * @group smoke
 */
import { oilExplorationOverlap } from "./oilExplorationOverlap";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof oilExplorationOverlap).toBe("function");
  });
  test("oilExplorationOverlapSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await oilExplorationOverlap(example);
      expect(result).toBeTruthy();
      writeResultOutput(
        result,
        "oilExplorationOverlap",
        example.properties.name
      );
    }
  }, 120000);
});
