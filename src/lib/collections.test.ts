import { describe, expect, it } from "vitest";

import { toArray } from "@/lib/collections";

describe("toArray", () => {
  it("returns the original array when the value is already an array", () => {
    expect(toArray(["a", "b"])).toEqual(["a", "b"]);
  });

  it("falls back to an empty array for nullish or invalid values", () => {
    expect(toArray(undefined)).toEqual([]);
    expect(toArray(null)).toEqual([]);
    expect(toArray("not-an-array")).toEqual([]);
  });
});
