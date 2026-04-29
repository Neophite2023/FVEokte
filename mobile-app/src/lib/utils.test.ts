import { describe, expect, it } from "vitest";
import { normalizeCity } from "./utils";

describe("normalizeCity", () => {
  it("normalizes known slovak cities", () => {
    expect(normalizeCity("kosice")).toBe("Košice");
    expect(normalizeCity("sala")).toBe("Šaľa");
  });

  it("fallbacks to title case", () => {
    expect(normalizeCity("unknown city")).toBe("Unknown City");
  });
});
