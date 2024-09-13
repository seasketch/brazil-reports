/**
 * @jest-environment node
 * @group smoke
 */
import { habitatsServices } from "./habitatsServices.js";
import { describe, test, expect } from "vitest";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof habitatsServices).toBe("function");
  });
  test("habitatsServicesSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await habitatsServices(example);
      expect(result).toBeTruthy();
      writeResultOutput(result, "habitatsServices", example.properties.name);
    }
  }, 120000);
});
