import "@testing-library/jest-dom";
import { expect } from "vitest";
import * as matchers from "vitest-axe/matchers";

// Register vitest-axe matchers (toHaveNoViolations)
expect.extend(matchers);

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
