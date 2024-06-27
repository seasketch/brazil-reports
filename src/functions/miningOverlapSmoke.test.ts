/**
 * @jest-environment node
 * @group smoke
 */
import { miningOverlap } from "./miningOverlap.js";
import { describe, test, expect } from "vitest";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof miningOverlap).toBe("function");
  });
  test("miningOverlapSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await miningOverlap(example);
      expect(result).toBeTruthy();
      writeResultOutput(result, "miningOverlap", example.properties.name);
    }
  }, 120000);
});
