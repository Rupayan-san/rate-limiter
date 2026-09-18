import { describe, it, expect } from "vitest";
import {
    TokenBucket,
    LeakyBucket,
    SlidingWindow,
    createRateLimiter,
    SemanticCache
} from "../../src/index.js";

describe("Public API", () => {
    it("should export rate limiter components", () => {
        expect(TokenBucket).toBeDefined();
        expect(LeakyBucket).toBeDefined();
        expect(SlidingWindow).toBeDefined();
        expect(createRateLimiter).toBeDefined();
    });

    it("should export SemanticCache", () => {
        expect(SemanticCache).toBeDefined();
    });
});