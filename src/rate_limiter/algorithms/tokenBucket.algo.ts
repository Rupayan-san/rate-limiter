import { client } from "../../config/redis.config.js";
import type { RateLimiter } from "../rateLimiter.interface.js";

class TokenBucket implements RateLimiter {
    private capacity: number;
    private refillRate: number;
    private readonly script = `
        local now = tonumber(ARGV[3])
        local capacity = tonumber(ARGV[1])
        local refillRate = tonumber(ARGV[2])

        local tokens = tonumber(
            redis.call("HGET", KEYS[1], "tokens")
        )

        local lastRefillTime

        if tokens == nil then

            tokens = capacity
            lastRefillTime = now

            redis.call("HSET", KEYS[1],
                "tokens", tokens,
                "lastRefillTime", lastRefillTime
            )

        else

            lastRefillTime = tonumber(
                redis.call("HGET", KEYS[1], "lastRefillTime")
            )

        end

        local elapsedTime = (now - lastRefillTime) / 1000

        local tokensToAdd = elapsedTime * refillRate

        local newTokens = math.min(
            capacity,
            tokens + tokensToAdd
        )

        if newTokens >= 1 then

            newTokens = newTokens - 1

            redis.call("HSET", KEYS[1],
                "tokens", newTokens,
                "lastRefillTime", now
            )

            return 1

        end

        redis.call("HSET", KEYS[1],
            "tokens", newTokens,
            "lastRefillTime", now
        )

        return 0
    `;

    constructor(capacity: number, refillRate: number) {
        this.capacity = capacity;
        this.refillRate = refillRate;
    }

    async allowRequest(userId: string): Promise<boolean> {
        const result = await this.runScript(userId);

        if(result === 1){
            return true;
        }
        return false;
    }

    async runScript(userId: string) {
        const result = await client.eval(this.script, {
            keys: [`token_bucket:${userId}`],
            arguments: [
                String(this.capacity),
                String(this.refillRate),
                String(Date.now()),
            ],
        });
        return result;
    }

    
}


export {
    TokenBucket,
}