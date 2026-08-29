class LeakyBucket {
    private capacity: number;
    private leakRate: number;
    private buckets = new Map<string, {
        currentLevel: number;
        lastLeakTime: number;
    }>();

    constructor(capacity: number, leakRate: number) {
        this.capacity = capacity;
        this.leakRate = leakRate;
    }

    getBucket(userId: string) {
        if (!this.buckets.has(userId)) {
            this.buckets.set(userId, {
                currentLevel: 0,
                lastLeakTime: Date.now(),
            });
        }
        return this.buckets.get(userId);
    }

    addRequest(userId: string): boolean {
        const bucket = this.getBucket(userId);
        if (!bucket) {
            throw new Error("Bucket could not be created");
        }
        if (bucket.currentLevel < this.capacity) {
            bucket.currentLevel++;
            return true;
        } else {
            return false;
        }
    }

    leakRequests(userId: string): void {
        const bucket = this.getBucket(userId);
        if (!bucket) {
            throw new Error("Bucket could not be created");
        }
        const now = Date.now();

        const elapsedTime = (now - bucket.lastLeakTime) / 1000;

        const leakedRequests = Math.floor(
            this.leakRate * elapsedTime
        );

        if (leakedRequests > 0) {
            bucket.currentLevel -= leakedRequests;

            if (bucket.currentLevel < 0) {
                bucket.currentLevel = 0;
            }

            bucket.lastLeakTime += (leakedRequests / this.leakRate) * 1000;
        }
    }

    allowRequest(userId: string): boolean {
        this.leakRequests(userId);
        return this.addRequest(userId);
    }

}

export { LeakyBucket };
