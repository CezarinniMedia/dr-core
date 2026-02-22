import "@testing-library/jest-dom";
import { expect } from "vitest";
import * as matchers from "vitest-axe/matchers";

// Register vitest-axe matchers (toHaveNoViolations)
expect.extend(matchers);

// Mock canvas for axe-core icon ligature detection (jsdom lacks canvas support)
HTMLCanvasElement.prototype.getContext = (() => null) as any;

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
