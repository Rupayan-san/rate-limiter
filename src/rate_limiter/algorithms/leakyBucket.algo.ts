class LeakyBucket {
    private capacity: number;
    private leakRate: number;
    private currentLevel: number;
    private lastLeakTime: number = Date.now();
    constructor(capacity: number, leakRate: number) {
        this.capacity = capacity;
        this.leakRate = leakRate;
        this.currentLevel = 0;
    }

    addRequest(): boolean {
        if (this.currentLevel < this.capacity) {
            this.currentLevel++;
            return true;
        } else {
            return false;
        }
    }

    leakRequests(): void {
        const now = Date.now();

        const elapsedTime = (now - this.lastLeakTime) / 1000;

        const leakedRequests = Math.floor(
            this.leakRate * elapsedTime
        );

        if (leakedRequests > 0) {
            this.currentLevel -= leakedRequests;

            if (this.currentLevel < 0) {
                this.currentLevel = 0;
            }

            // Only advance time by the amount actually used
            this.lastLeakTime += (leakedRequests / this.leakRate) * 1000;
        }
    }

    allowRequest(): boolean {
        this.leakRequests();
        return this.addRequest();
    }

}

export { LeakyBucket };
