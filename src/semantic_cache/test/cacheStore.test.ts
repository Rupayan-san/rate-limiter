import { createCacheService, getCacheService, searchCacheService } from "../services/semantic_cache.service.js";
import { describe, it, expect } from "vitest";
import { client } from "../../rate_limiter/test/setup.js";


describe("Cache Store Tests", () => {
    it("should create a cache entry in Redis", async () => {
        await createCacheService("How do I reset my password?", "Go to Settings...", client);
    }, 10000); // Increase timeout for async operations


    it("should retrieve a cache entry from Redis", async () => {
        const cacheId = "123";

        const cacheEntry = await getCacheService(cacheId, client);

        expect(cacheEntry).toBeDefined();
        expect(cacheEntry?.query).toBe("How do I reset my password?");
        expect(cacheEntry?.response).toBe("Go to Settings...");
        expect(cacheEntry?.embedding).toBeDefined();
    });


    it("should search for a cache entry in Redis", async () => {
        const cacheEntry = await searchCacheService(
            "How do I reset my password?", client
        );

        expect(cacheEntry).toBeDefined();
        expect(cacheEntry?.query).toBe("How do I reset my password?");
        expect(cacheEntry?.response).toBe("Go to Settings...");
        expect(cacheEntry?.similarityScore).toBeDefined();
    });
});