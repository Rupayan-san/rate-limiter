import { describe, it, expect } from "vitest";
import { isCacheHit } from "../services/semantic_cache.service.js";


describe("isCacheHit", () => {
    it("should return true if cache hit", () => {
        expect(isCacheHit(0.8)).toBe(true);
    });

    it("should return false if cache miss", () => {
        expect(isCacheHit(0.2)).toBe(false);
    });
});