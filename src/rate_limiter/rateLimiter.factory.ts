import type { RedisClientType } from "redis";
import type { RateLimiter } from "./rateLimiter.interface.js";
import { TokenBucket } from "./algorithms/tokenBucket.algo.js";
import { LeakyBucket } from "./algorithms/leakyBucket.algo.js";
import { SlidingWindow } from "./algorithms/slidingWindow.algo.js";

type RateLimiterOptions =
    | {
        algorithm: "token-bucket";
        capacity: number;
        refillRate: number;
        client: RedisClientType;
    }
    | {
        algorithm: "leaky-bucket";
        capacity: number;
        leakRate: number;
        client: RedisClientType;
    }
    | {
        algorithm: "sliding-window";
        windowSize: number;
        maxRequests: number;
        client: RedisClientType;
    };

function createRateLimiter(options: RateLimiterOptions): RateLimiter {
    switch (options.algorithm) {
        case "token-bucket":
            return new TokenBucket(
                options.capacity,
                options.refillRate,
                options.client
            );

        case "leaky-bucket":
            return new LeakyBucket(
                options.capacity,
                options.leakRate,
                options.client
            );

        case "sliding-window":
            return new SlidingWindow(
                options.windowSize,
                options.maxRequests,
                options.client
            );
    }
}

export { createRateLimiter };
export type { RateLimiterOptions };