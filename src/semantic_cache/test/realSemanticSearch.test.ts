import { describe, it, expect } from "vitest";
import { returnCache } from "../services/semantic_cache.service.js";

describe("Real Semantic Search", () => {
    it("should return a cache miss", async () => {
        const cacheMiss = await returnCache("What is the capital of usa?");
        console.log(cacheMiss);
        expect(cacheMiss).toBeTruthy();
        expect(typeof cacheMiss).toBe("string");
    }, 20000);


    it("should return a cache hit", async () => {
        const cacheHit = await returnCache("what is the name of capital of usa");
        console.log(cacheHit);
        expect(cacheHit).toBeTruthy();
        expect(typeof cacheHit).toBe("string");
    });

});