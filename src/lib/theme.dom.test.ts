// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";

import { disableTransitionsTemporarily } from "@/lib/theme";

describe("disableTransitionsTemporarily", () => {
  afterEach(() => {
    vi.useRealTimers();
    document.head.querySelectorAll("style").forEach((style) => {
      if (style.textContent.includes("transition:none!important")) {
        style.remove();
      }
    });
  });

  it("adds and then removes the transition suppression style", () => {
    vi.useFakeTimers();

    const restore = disableTransitionsTemporarily();
    const style = Array.from(document.head.querySelectorAll("style")).find((node) =>
      node.textContent.includes("transition:none!important"),
    );

    expect(restore).not.toBeNull();
    expect(style).toBeDefined();

    if (restore) {
      restore();
    }
    vi.runAllTimers();

    const remainingStyle = Array.from(document.head.querySelectorAll("style")).find((node) =>
      node.textContent.includes("transition:none!important"),
    );
    expect(remainingStyle).toBeUndefined();
  });
});
