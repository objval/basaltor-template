import { describe, expect, it } from "vitest";

import { createTopUpLicenseKeys } from "@/lib/license-key-seeding";

describe("createTopUpLicenseKeys", () => {
  it("generates new sequential keys when available inventory drops below the target", () => {
    const keys = createTopUpLicenseKeys({
      prefix: "ACCESS-1D",
      existingValues: new Set(["ACCESS-1D-001", "ACCESS-1D-002", "ACCESS-1D-003"]),
      currentAvailableCount: 1,
      minimumAvailableCount: 4,
    });

    expect(keys).toEqual(["ACCESS-1D-004", "ACCESS-1D-005", "ACCESS-1D-006"]);
  });

  it("returns no keys when the available pool already meets the target", () => {
    const keys = createTopUpLicenseKeys({
      prefix: "ACCESS-1W",
      existingValues: new Set(["ACCESS-1W-001", "ACCESS-1W-002"]),
      currentAvailableCount: 3,
      minimumAvailableCount: 2,
    });

    expect(keys).toEqual([]);
  });
});
