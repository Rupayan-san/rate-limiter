import { client } from "../../config/redis.config.js";
import type { RateLimiter } from "../rateLimiter.interface.js";

class LeakyBucket implements RateLimiter {
    private capacity: number;
    private leakRate: number;

    private readonly script = `
        local capacity = tonumber(ARGV[1])
        local leakRate = tonumber(ARGV[2])
        local now = tonumber(ARGV[3])
        local lastLeakTime = tonumber(redis.call("HGET", KEYS[1], "lastLeakTime"))
        local currentLevel = tonumber(redis.call("HGET", KEYS[1], "currentLevel"))

        if currentLevel == nil then
            currentLevel = 0
            lastLeakTime = now
            redis.call("HSET", KEYS[1],
                "currentLevel", currentLevel,
                "lastLeakTime", now
            )
        
        else 
            lastLeakTime = tonumber(redis.call("HGET", KEYS[1], "lastLeakTime"))
        end
            
        local elapsedTime = (now - lastLeakTime) / 1000
        local leakedRequests = math.floor(leakRate * elapsedTime)

        if leakedRequests > 0 then
            currentLevel = currentLevel - leakedRequests
            if (currentLevel < 0) then
                currentLevel = 0
            end
            lastLeakTime = lastLeakTime + (leakedRequests / leakRate) * 1000
        end

        local allowed = 0
        if (currentLevel < capacity) then
            currentLevel = currentLevel + 1
            allowed = 1
        end

        redis.call("HSET", KEYS[1],
            "currentLevel", currentLevel,
            "lastLeakTime", lastLeakTime
        )

        return allowed
    `;

    constructor(capacity: number, leakRate: number) {
        this.capacity = capacity;
        this.leakRate = leakRate;
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
            keys: [`leaky_bucket:${userId}`],
            arguments: [
                String(this.capacity),
                String(this.leakRate),
                String(Date.now()),
            ],
        });
        return result;
    }
    

}

export { LeakyBucket };
