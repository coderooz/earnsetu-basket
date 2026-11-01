/** @format */

import {
  atLocalNoon,
  currentMonthKey,
  dateKeyOf,
  daysInMonth,
  firstWeekdayOfMonth,
  formatDateLabel,
  formatMonthYear,
  monthKeyOf,
  normaliseIsoTimestamp,
  todayDateKey,
  todayParts,
  toDateKey,
} from "../date";

describe("date", () => {
  describe("toDateKey / todayDateKey", () => {
    it("produces a YYYY-MM-DD key", () => {
      const d = new Date(2026, 5, 15);
      expect(toDateKey(d)).toBe("2026-06-15");
    });

    it("todayDateKey matches today's local date", () => {
      const now = new Date();
      const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      expect(todayDateKey()).toBe(expected);
    });
  });

  describe("dateKeyOf / monthKeyOf / currentMonthKey", () => {
    it("derives a local calendar key from a local ISO string", () => {
      expect(dateKeyOf("2026-06-15T12:00:00")).toBe("2026-06-15");
      expect(monthKeyOf("2026-06-15T12:00:00")).toBe("2026-06");
      expect(currentMonthKey()).toBe(todayDateKey().slice(0, 7));
    });

    it("falls back to the first 10 chars for unparsable input", () => {
      expect(dateKeyOf("not-a-date")).toBe("not-a-date");
    });
  });

  describe("atLocalNoon round-trip", () => {
    it("stores at local noon and reads back the same calendar day", () => {
      const key = "2026-06-15";
      expect(dateKeyOf(atLocalNoon(key))).toBe(key);
    });
  });

  describe("formatDateLabel / formatMonthYear", () => {
    it("formats a date label", () => {
      expect(formatDateLabel("2026-06-15T12:00:00Z")).toContain("2026");
    });

    it("formats month and year", () => {
      expect(formatMonthYear(2026, 5)).toContain("2026");
    });
  });

  describe("daysInMonth / firstWeekdayOfMonth / todayParts", () => {
    it("knows days in a month", () => {
      expect(daysInMonth(2026, 2)).toBe(28);
      expect(daysInMonth(2024, 2)).toBe(29);
    });

    it("returns the first weekday index", () => {
      const wd = firstWeekdayOfMonth(2026, 1);
      expect(wd).toBeGreaterThanOrEqual(0);
      expect(wd).toBeLessThanOrEqual(6);
    });

    it("returns today parts", () => {
      const parts = todayParts();
      expect(parts.year).toBeGreaterThan(2000);
      expect(parts.month).toBeGreaterThanOrEqual(1);
      expect(parts.month).toBeLessThanOrEqual(12);
      expect(parts.day).toBeGreaterThanOrEqual(1);
    });
  });

  describe("normaliseIsoTimestamp", () => {
    it("normalises a bare date key to local noon ISO", () => {
      expect(normaliseIsoTimestamp("2026-06-15")).toContain("2026-06-15T");
    });

    it("returns undefined for invalid input", () => {
      expect(normaliseIsoTimestamp(undefined)).toBeUndefined();
      expect(normaliseIsoTimestamp("not-a-date")).toBeUndefined();
    });
  });
});
