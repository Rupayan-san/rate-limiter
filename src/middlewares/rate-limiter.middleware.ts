import type { Request, Response, NextFunction } from 'express';
import type { RateLimiter } from '../rate_limiter/rateLimiter.interface.js';


export const rateLimitMiddleware  = (rateLimiter: RateLimiter) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.params.userId as string;

        if (!userId) {
            return res.status(400).send('User ID is required');
        }

        if (await rateLimiter.allowRequest(userId)) {
            next();
        } else {
            return res.status(429).send('Rate limit exceeded');
        }
    };
};

