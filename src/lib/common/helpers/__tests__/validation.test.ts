/** @format */

import {
  optionalText,
  requireIdentifier,
  requireNonNegativeMinor,
  requirePositiveNumber,
  requireText,
  toUserMessage,
  ValidationError,
} from "../validation";

describe("validation", () => {
  describe("requireText", () => {
    it("trims and collapses whitespace", () => {
      expect(requireText("  Rice   and   beans  ", "an item")).toBe("Rice and beans");
    });

    it("throws for empty input", () => {
      expect(() => requireText("", "a name")).toThrow(ValidationError);
      expect(() => requireText("   ", "a name")).toThrow(ValidationError);
    });

    it("throws when too long", () => {
      expect(() => requireText("a".repeat(101), "a name")).toThrow(ValidationError);
    });
  });

  describe("requireIdentifier", () => {
    it("returns the trimmed value", () => {
      expect(requireIdentifier("  list-1  ", "a list")).toBe("list-1");
    });

    it("throws for empty input", () => {
      expect(() => requireIdentifier(undefined, "a list")).toThrow(ValidationError);
    });
  });

  describe("requirePositiveNumber", () => {
    it("accepts positive finite numbers", () => {
      expect(requirePositiveNumber(1, "Quantity")).toBe(1);
      expect(requirePositiveNumber(2.5, "Quantity")).toBe(2.5);
    });

    it("rejects zero, negatives and non-finite", () => {
      expect(() => requirePositiveNumber(0, "Quantity")).toThrow(ValidationError);
      expect(() => requirePositiveNumber(-1, "Quantity")).toThrow(ValidationError);
      expect(() => requirePositiveNumber(undefined, "Quantity")).toThrow(ValidationError);
      expect(() => requirePositiveNumber(NaN, "Quantity")).toThrow(ValidationError);
    });
  });

  describe("requireNonNegativeMinor", () => {
    it("accepts zero and positive numbers", () => {
      expect(requireNonNegativeMinor(0, "price")).toBe(0);
      expect(requireNonNegativeMinor(100, "price")).toBe(100);
    });

    it("rounds and rejects negatives", () => {
      expect(requireNonNegativeMinor(10.7, "price")).toBe(11);
      expect(() => requireNonNegativeMinor(-1, "price")).toThrow(ValidationError);
    });
  });

  describe("optionalText", () => {
    it("returns undefined for empty input", () => {
      expect(optionalText(undefined)).toBeUndefined();
      expect(optionalText("   ")).toBeUndefined();
    });

    it("truncates long input", () => {
      expect(optionalText("a".repeat(600), 10)).toBe("a".repeat(10));
    });
  });

  describe("toUserMessage", () => {
    it("returns the error message for Errors", () => {
      expect(toUserMessage(new Error("boom"), "fallback")).toBe("boom");
    });

    it("returns the fallback otherwise", () => {
      expect(toUserMessage(null, "fallback")).toBe("fallback");
      expect(toUserMessage("string", "fallback")).toBe("fallback");
    });
  });
});
