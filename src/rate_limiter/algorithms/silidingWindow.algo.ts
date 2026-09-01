import type { RateLimiter } from '../rateLimiter.interface.js';
import { client } from '../../config/redis.config.js';

export class SlidingWindow implements RateLimiter {
    private windowSize: number;
    private maxRequests: number;

    private readonly script = `
        local now = tonumber(ARGV[1])
        local maxRequests = tonumber(ARGV[2])
        local windowSize = tonumber(ARGV[3])
        local requestId = ARGV[4]
        local windowStart = now - windowSize * 1000

        redis.call(
            "ZREMRANGEBYSCORE",
            KEYS[1],
            0,
            windowStart
        )

        local requestCount = redis.call("ZCARD", KEYS[1])
        if requestCount < maxRequests then
            redis.call(
                "ZADD",
                KEYS[1],
                now,
                requestId
            )
            return 1
        end

        return 0
    `
    constructor(windowSize: number, maxRequests: number) {
        this.windowSize = windowSize;
        this.maxRequests = maxRequests;
    }


    async allowRequest(userId: string): Promise<boolean> {
        const requestId = `${Date.now()}-${crypto.randomUUID()}`;
        const result = await this.runScript(userId, requestId);
        return Boolean(result);
    }


    async runScript(userId: string, requestId: string): Promise<number> {
        const result = await client.eval(this.script, {
            keys: [`sliding_window:${userId}`],
            arguments: [
                String(Date.now()),
                String(this.maxRequests),
                String(this.windowSize),
                requestId
            ],
        });
        return result as number;
    } 

}
