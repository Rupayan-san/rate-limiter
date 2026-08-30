import type { Request, Response, NextFunction } from 'express';
import { TokenBucket } from '../rate_limiter/algorithms/tokenBucket.algo.js';

export const accessBucket = (tokenBucket: TokenBucket) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.params.userId as string;

        if (!userId) {
            return res.status(400).send('User ID is required');
        }

        if (await tokenBucket.allowRequest(userId)) {
            next();
        } else {
            return res.status(429).send('Rate limit exceeded');
        }
    };
};

