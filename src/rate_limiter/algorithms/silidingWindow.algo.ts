export class SlidingWindow {
    private windowSize: number;
    private maxRequests: number;
    private requestTimestamps: Map<string, number[]>;
    
    constructor(windowSize: number, maxRequests: number) {
        this.windowSize = windowSize;
        this.maxRequests = maxRequests;
        this.requestTimestamps = new Map<string, number[]>();
    }

    getWindowTimestamps(userId: string): number[] | undefined{
        if(this.requestTimestamps.has(userId)){
            return this.requestTimestamps.get(userId);
        }else{
            this.requestTimestamps.set(userId, []);
            return this.requestTimestamps.get(userId);
        }
    }

    addRequest(userId: string): boolean {
        const now = Date.now();
        this.cleanupOldRequests(now, userId);
        const window = this.getWindowTimestamps(userId);
        if(window && window.length < this.maxRequests){
            window.push(now);
            return true;
        }
        return false;
    }

    private cleanupOldRequests(now: number, userId: string): void {
        const windowStart = now - this.windowSize * 1000; // Convert window size to milliseconds

        const window = this.getWindowTimestamps(userId);
        if (window) {
            this.requestTimestamps.set(
                userId,
                window.filter(timestamp => timestamp > windowStart)
            );
        }
        
    }
}
