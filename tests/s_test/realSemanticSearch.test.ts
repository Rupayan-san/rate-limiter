import { describe, it, expect } from "vitest";
import { SemanticCache } from "../../src/semantic_cache/services/semantic_cache.service.js";
import { client } from "../../rate_limiter/test/setup.js";

describe("Real Semantic Search", () => {
    it("should return a cache miss", async () => {
        const cacheMiss = await SemanticCache("What is the capital of usa?", client);
        console.log(cacheMiss);
        expect(cacheMiss).toBeTruthy();
        expect(typeof cacheMiss).toBe("string");
    }, 20000);


    it("should return a cache hit", async () => {
        const cacheHit = await SemanticCache("what is the name of capital of usa", client);
        console.log(cacheHit);
        expect(cacheHit).toBeTruthy();
        expect(typeof cacheHit).toBe("string");
    });

});