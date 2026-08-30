import { client } from "../../config/redis.config.js";

class TokenBucket {
    private capacity: number;
    private refillRate: number;

    constructor(capacity: number, refillRate: number) {
        this.capacity = capacity;
        this.refillRate = refillRate;
    }

    async getBucket(userId: string) {
        let data = await client.hGetAll(`user:${userId}`);

        if (Object.keys(data).length === 0) {
            await client.hSet(`user:${userId}`, {
                tokens: this.capacity,
                lastRefillTime: Date.now(),
            });

            data = await client.hGetAll(`user:${userId}`);
        }

        return {
            tokens: Number(data.tokens),
            lastRefillTime: Number(data.lastRefillTime),
        };
    }

    async refillTokens(userId: string) {
        const bucket = await this.getBucket(userId);
        if (!bucket) {
            throw new Error("Bucket could not be created");
        }
        const now = Date.now();
        const elapsedTime = (now - bucket.lastRefillTime) / 1000;
        const tokensToAdd = elapsedTime * this.refillRate;
        bucket.tokens = Math.min(this.capacity, bucket.tokens + tokensToAdd);
        bucket.lastRefillTime = now;
        await this.saveBucket(userId, bucket);
    }

    async allowRequest(userId: string): Promise<boolean> {
        await this.refillTokens(userId);
        const bucket = await this.getBucket(userId);
        if (bucket && bucket.tokens >= 1) {
            bucket.tokens -= 1;
            await this.saveBucket(userId, bucket);
            return true;
        }
        return false;
    }

    async saveBucket(userId: string, bucket: {
        tokens: number;
        lastRefillTime: number;
    }) {
        await client.hSet(`user:${userId}`, bucket);
    }
}


export {
    TokenBucket,
}