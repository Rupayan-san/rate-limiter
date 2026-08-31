import { client } from "../../config/redis.config.js";

class TokenBucket {
    private capacity: number;
    private refillRate: number;
    private readonly script = `
        local now = tonumber(ARGV[3])
        
        local exists = redis.call("EXISTS", KEYS[1])
        
        if exists == 0 then
            redis.call("HSET", KEYS[1],
                "tokens", ARGV[1],
                "lastRefillTime", now
            )
        end
        
        local tokens = redis.call("HGET", KEYS[1], "tokens")
        local lastRefillTime = redis.call("HGET", KEYS[1], "lastRefillTime")
        local elapsedTime = (now - tonumber(lastRefillTime)) / 1000
        local tokensToAdd = elapsedTime * tonumber(ARGV[2])

        local newTokens = math.min(tonumber(ARGV[1]), tonumber(tokens) + tokensToAdd)
        
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
            keys: [`user:${userId}`],
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