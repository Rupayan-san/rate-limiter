
interface RateLimiter {
    allowRequest(userId: string): Promise<boolean>;
}

export type { RateLimiter };