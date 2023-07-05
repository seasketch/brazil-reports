/**
 * @jest-environment node
 * @group smoke
 */
import { trawlingOverlap } from "./trawlingOverlap";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof trawlingOverlap).toBe("function");
  });
  test("ousValueOverlapSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await trawlingOverlap(example);
      expect(result).toBeTruthy();
      writeResultOutput(result, "ousValueOverlap", example.properties.name);
    }
  }, 120000);
});
