import { createCacheService, getCacheService } from "../services/semantic_cache.service.js";
import { describe, it, expect } from "vitest";


describe("Cache Store Tests", () => {
    it("should create a cache entry in Redis", async () => {
        await createCacheService();
    }, 10000); // Increase timeout for async operations

    it("should retrieve a cache entry from Redis", async () => {
        const cacheId = "123";

        const cacheEntry = await getCacheService(cacheId);

        expect(cacheEntry).toBeDefined();
        expect(cacheEntry?.query).toBe("How do I reset my password?");
        expect(cacheEntry?.response).toBe("Go to Settings...");
        expect(cacheEntry?.embedding).toBeDefined();
    });
});