/**
 * Test Setup for SEAL Integration Tests
 */

// Setup for Jest/Node.js environment

// Polyfills for Node.js environment
if (typeof globalThis.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  globalThis.TextEncoder = TextEncoder;
  globalThis.TextDecoder = TextDecoder;
}

// Increase test timeout for SEAL operations
jest.setTimeout(120000); // 2 minutes

// Mock console methods for cleaner test output
const originalConsole = console;

beforeAll(() => {
  console.log = jest.fn((...args) => {
    if (process.env.VERBOSE_TESTS === 'true') {
      originalConsole.log(...args);
    }
  });
});

afterAll(() => {
  console.log = originalConsole.log;
});