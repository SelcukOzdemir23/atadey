import { expect, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Polyfill for global objects needed by jsdom in Node.js environment
beforeAll(() => {
  // Ensure global WeakMap exists (needed by webidl-conversions)
  if (typeof global.WeakMap === 'undefined') {
    global.WeakMap = WeakMap;
  }
  
  // Ensure other global constructors exist
  if (typeof global.Map === 'undefined') {
    global.Map = Map;
  }
  
  if (typeof global.Set === 'undefined') {
    global.Set = Set;
  }
});

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
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

// Mock Clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: async (_text: string) => {
      return Promise.resolve();
    },
    write: async (_data: ClipboardItem[]) => {
      return Promise.resolve();
    },
  },
});
