import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("design tokens", () => {
  const css = readFileSync(join(process.cwd(), "src/styles.css"), "utf8");

  it("keeps the sharp border system", () => {
    expect(css).toContain("--radius: 0;");
    expect(css).toContain("--radius-lg: var(--radius);");
  });

  it("defines semantic color tokens for shadcn components", () => {
    [
      "--background",
      "--foreground",
      "--primary",
      "--secondary",
      "--muted",
      "--accent",
      "--border",
      "--input",
      "--ring",
    ].forEach((token) => {
      expect(css).toContain(token);
    });
  });

  it("supports dark theme tokens", () => {
    expect(css).toContain(".dark {");
    expect(css).toContain("--sidebar-primary");
  });
});
