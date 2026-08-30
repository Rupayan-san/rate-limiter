import express from 'express';
import dotenv from 'dotenv';
import { accessBucket } from './middlewares/tokenBucket.middleware.js';
import { TokenBucket } from './rate_limiter/algorithms/tokenBucket.algo.js';
import { LeakyBucket } from './rate_limiter/algorithms/leakyBucket.algo.js';
import { SlidingWindow } from './rate_limiter/algorithms/silidingWindow.algo.js'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const tokenBucket = new TokenBucket(3, 0.1); // capacity of 3 tokens, refill rate of 1 token per 10 seconds
const leakyBucket = new LeakyBucket(3, 0.1); // capacity of 3 requests, leak rate of 1 request per 10 seconds
const slidingWindow = new SlidingWindow(10, 3) // capacity of 3 requests, window size of 10 second


app.get(
    '/api/slide/:userId',
    (req, res) => {
        const userId = req.params.userId as string;
        if (slidingWindow.addRequest(userId)) {
            res.status(200).send('Request allowed');
        } else {
            res.status(429).send('Request denied');
        }
    }
);

app.get(
    '/api/:userId',
    accessBucket(tokenBucket),
    (req, res) => {
        res.status(200).send('Request allowed');
    }
);

app.get(
    '/api/leaky/:userId',
    (req, res) => {
        const userId = req.params.userId as string;
        if(userId){

            if (leakyBucket.allowRequest(userId)) {
                res.status(200).send('Request allowed');
            } else {
                res.status(429).send('Request denied');
            }
        }
        
    }
);

app.get('/healthcheck', (req, res) => {
  res.status(200).send('OK');
});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});