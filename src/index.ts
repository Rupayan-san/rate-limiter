import express from 'express';
import dotenv from 'dotenv';
import { accessBucket } from './middlewares/rateLimiter.middleware.js';
import { TokenBucket } from './rate_limiter/algorithms/tokenBucket.algo.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const tokenBucket = new TokenBucket(3, 1); // capacity of 3 tokens, refill rate of 1 token per second


app.get(
    '/api/:userId',
    accessBucket(tokenBucket),
    (req, res) => {
        res.status(200).send('Request allowed');
    }
);


app.get('/healthcheck', (req, res) => {
  res.status(200).send('OK');
});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});