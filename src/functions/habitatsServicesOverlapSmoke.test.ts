/**
 * @jest-environment node
 * @group smoke
 */
import { habitatsServicesOverlap } from "./habitatsServicesOverlap.js";
import { describe, test, expect } from "vitest";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof habitatsServicesOverlap).toBe("function");
  });
  test("habitatsServicesOverlapSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await habitatsServicesOverlap(example);
      expect(result).toBeTruthy();
      writeResultOutput(
        result,
        "habitatsServicesOverlap",
        example.properties.name
      );
    }
  }, 120000);
});
