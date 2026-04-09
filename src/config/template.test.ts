import { describe, expect, it } from "vitest";

import { buildLocalTemplateEmailHost, templateConfig } from "@/config/template";

describe("template config", () => {
  it("derives a stable local email host from the site slug", () => {
    expect(buildLocalTemplateEmailHost("Digital Market Template")).toBe("digital-market-template.local");
    expect(buildLocalTemplateEmailHost("Store___42")).toBe("store-42.local");
  });

  it("exposes clone-friendly development credentials", () => {
    expect(templateConfig.devAdmin.email).toContain("admin@");
    expect(templateConfig.devAdmin.email.endsWith(".local")).toBe(true);
    expect(templateConfig.devAdmin.password).toBe("ChangeMe!2345");
  });
});
