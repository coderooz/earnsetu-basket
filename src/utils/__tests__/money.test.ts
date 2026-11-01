/** @format */

import {
  fromMinorUnits,
  formatMoney,
  parseAmountInput,
  toMinorUnits,
} from "../money";

describe("money", () => {
  describe("toMinorUnits", () => {
    it("converts whole amounts", () => {
      expect(toMinorUnits(10)).toBe(1000);
    });

    it("converts fractional amounts", () => {
      expect(toMinorUnits(60.25)).toBe(6025);
      expect(toMinorUnits(0.99)).toBe(99);
    });

    it("rounds banker-style halves away from zero", () => {
      expect(toMinorUnits(0.005)).toBe(1);
    });
  });

  describe("fromMinorUnits", () => {
    it("converts back to major units", () => {
      expect(fromMinorUnits(1000)).toBe(10);
      expect(fromMinorUnits(6025)).toBe(60.25);
      expect(fromMinorUnits(99)).toBe(0.99);
    });

    it("returns null for invalid input", () => {
      expect(fromMinorUnits(undefined)).toBeNull();
      expect(fromMinorUnits(null)).toBeNull();
      expect(fromMinorUnits(NaN)).toBeNull();
    });
  });

  describe("parseAmountInput", () => {
    it("parses valid amounts", () => {
      expect(parseAmountInput("60.25")).toBe(6025);
      expect(parseAmountInput("1,000.00")).toBe(100000);
      expect(parseAmountInput("0")).toBe(0);
    });

    it("returns null for empty or invalid input", () => {
      expect(parseAmountInput("")).toBeNull();
      expect(parseAmountInput("   ")).toBeNull();
      expect(parseAmountInput("abc")).toBeNull();
      expect(parseAmountInput("-5")).toBeNull();
    });
  });

  describe("formatMoney", () => {
    it("returns a non-empty currency string", () => {
      const result = formatMoney(6025, "INR");
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("defaults to INR", () => {
      expect(formatMoney(100)).toBe(formatMoney(100, "INR"));
    });

    it("formats zero", () => {
      expect(formatMoney(0)).toBe(formatMoney(0, "INR"));
    });
  });
});
