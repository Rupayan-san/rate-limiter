import { createCacheService, getCacheService } from "../services/semantic_cache.service.js";
import { describe, it, expect } from "vitest";
import { client } from "../../config/redis.config.js";
import { createClient } from "redis";



describe("Cache Store Tests", () => {
    it("should create a cache entry in Redis", async () => {
        await createCacheService();
    });

    // it("should retrieve a cache entry from Redis", async () => {
    //     const cache_id = "123";
    //     const cacheEntry = await getCacheService(cache_id);
    //     expect(cacheEntry).toBeDefined();
    // });
});