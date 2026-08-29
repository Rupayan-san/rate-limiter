class TokenBucket {
    private capacity: number;
    private refillRate: number;
    
    private buckets = new Map<string, {
        tokens: number;
        lastRefillTime: number;
    }>();

    constructor(capacity: number, refillRate: number) {
        this.capacity = capacity;
        this.refillRate = refillRate;
    }

    getBucket(userId: string) {
        if (!this.buckets.has(userId)) {
            this.buckets.set(userId, {
                tokens: this.capacity,
                lastRefillTime: Date.now(),
            });
        }
        return this.buckets.get(userId);
    }

    refillTokens(userId: string) {
        const bucket = this.getBucket(userId);
        if (!bucket) {
            throw new Error("Bucket could not be created");
        }
        const now = Date.now();
        const elapsedTime = (now - bucket.lastRefillTime) / 1000;
        const tokensToAdd = elapsedTime * this.refillRate;
        bucket.tokens = Math.min(this.capacity, bucket.tokens + tokensToAdd);
        bucket.lastRefillTime = now;
    }

    allowRequest(userId: string): boolean {
        this.refillTokens(userId);
        const bucket = this.getBucket(userId);
        if (bucket && bucket.tokens >= 1) {
            bucket.tokens -= 1;
            return true;
        }
        return false;
    }
}


export {
    TokenBucket,
}