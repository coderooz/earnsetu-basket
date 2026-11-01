/** @format */

module.exports = {
  preset: "jest-expo",
  testMatch: ["<rootDir>/src/**/__tests__/**/*.test.ts?(x)"],
  clearMocks: true,
  collectCoverageFrom: [
    "src/lib/**/*.{ts,tsx}",
    "src/utils/**/*.{ts,tsx}",
    "!src/**/__tests__/**",
  ],
};
