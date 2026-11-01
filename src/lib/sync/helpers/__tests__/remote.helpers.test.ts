/** @format */

import {
  buildResourceUrl,
  buildSyncUrl,
  classifyHttpStatus,
  isUsableRemoteRecord,
  parseRemotePage,
  shouldApplyRemoteRecord,
} from "../remote.helpers";

describe("remote helpers", () => {
  describe("classifyHttpStatus", () => {
    it("classifies 2xx as ok", () => {
      expect(classifyHttpStatus(200)).toBe("ok");
      expect(classifyHttpStatus(299)).toBe("ok");
    });

    it("classifies 401/403 as auth", () => {
      expect(classifyHttpStatus(401)).toBe("auth");
      expect(classifyHttpStatus(403)).toBe("auth");
    });

    it("classifies retryable statuses", () => {
      expect(classifyHttpStatus(408)).toBe("retryable");
      expect(classifyHttpStatus(429)).toBe("retryable");
      expect(classifyHttpStatus(500)).toBe("retryable");
      expect(classifyHttpStatus(503)).toBe("retryable");
    });

    it("classifies everything else as rejected", () => {
      expect(classifyHttpStatus(400)).toBe("rejected");
      expect(classifyHttpStatus(404)).toBe("rejected");
      expect(classifyHttpStatus(409)).toBe("rejected");
    });
  });

  describe("buildResourceUrl / buildSyncUrl", () => {
    it("builds a resource url with limit and cursor", () => {
      expect(buildResourceUrl("https://api.example.com", "lists", "abc", 50)).toBe(
        "https://api.example.com/api/basket/lists?limit=50&cursor=abc",
      );
    });

    it("omits cursor when absent", () => {
      expect(buildResourceUrl("https://api.example.com", "shops")).toBe(
        "https://api.example.com/api/basket/shops?limit=100",
      );
    });

    it("strips trailing slashes", () => {
      expect(buildResourceUrl("https://api.example.com/", "purchases")).toBe(
        "https://api.example.com/api/basket/purchases?limit=100",
      );
    });

    it("builds the sync url", () => {
      expect(buildSyncUrl("https://api.example.com")).toBe(
        "https://api.example.com/api/basket/sync",
      );
    });
  });

  describe("parseRemotePage", () => {
    it("parses a valid envelope", () => {
      const result = parseRemotePage({ items: [{ id: "1" }], nextToken: "tok" });
      expect(result.items).toEqual([{ id: "1" }]);
      expect(result.nextToken).toBe("tok");
    });

    it("defaults nextToken to null", () => {
      expect(parseRemotePage({ items: [] }).nextToken).toBeNull();
      expect(parseRemotePage({ items: [], nextToken: null }).nextToken).toBeNull();
    });

    it("throws for invalid payloads", () => {
      expect(() => parseRemotePage(null)).toThrow();
      expect(() => parseRemotePage({ items: "not-an-array" })).toThrow();
      expect(() => parseRemotePage({ nextToken: "tok" })).toThrow();
    });
  });

  describe("isUsableRemoteRecord", () => {
    it("accepts records with a non-empty string id", () => {
      expect(isUsableRemoteRecord({ id: "abc", name: "x" })).toBe(true);
    });

    it("rejects missing or empty ids", () => {
      expect(isUsableRemoteRecord({ name: "x" })).toBe(false);
      expect(isUsableRemoteRecord({ id: "" })).toBe(false);
      expect(isUsableRemoteRecord(null)).toBe(false);
      expect(isUsableRemoteRecord("string")).toBe(false);
      expect(isUsableRemoteRecord({ id: 123 })).toBe(false);
    });
  });

  describe("shouldApplyRemoteRecord", () => {
    it("applies when there is no local record", () => {
      expect(shouldApplyRemoteRecord(undefined)).toBe(true);
    });

    it("applies synced records", () => {
      expect(shouldApplyRemoteRecord({ syncStatus: "synced" })).toBe(true);
      expect(shouldApplyRemoteRecord({} as any)).toBe(true);
    });

    it("rejects locally pending records", () => {
      expect(shouldApplyRemoteRecord({ syncStatus: "pending" })).toBe(false);
      expect(shouldApplyRemoteRecord({ syncStatus: "local" })).toBe(false);
    });
  });
});
