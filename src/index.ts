import express from 'express';
import dotenv from 'dotenv';
import { rateLimitMiddleware  } from './middlewares/rate-limiter.middleware.js';
import { TokenBucket } from './rate_limiter/algorithms/tokenBucket.algo.js';
import { LeakyBucket } from './rate_limiter/algorithms/leakyBucket.algo.js';
import { SlidingWindow } from './rate_limiter/algorithms/silidingWindow.algo.js'
import { EmbeddingService } from './semantic_cache/services/embedding.service.js';
import { cosineSimilarity } from './semantic_cache/utils/similarity.utils.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const tokenBucket = new TokenBucket(3, 0.1); // capacity of 3 tokens, refill rate of 1 token per 10 seconds
const leakyBucket = new LeakyBucket(3, 0.1); // capacity of 3 requests, leak rate of 1 request per 10 seconds
const slidingWindow = new SlidingWindow(10, 3) // capacity of 3 requests, window size of 10 second


app.get('/token-bucket/:userId', rateLimitMiddleware(tokenBucket), (req, res) => {
  res.send('Request allowed by Token Bucket');
});

app.get('/leaky-bucket/:userId', rateLimitMiddleware(leakyBucket), (req, res) => {
  res.send('Request allowed by Leaky Bucket');
});

app.get('/sliding-window/:userId', rateLimitMiddleware(slidingWindow), (req, res) => {
  res.send('Request allowed by Sliding Window');
});


app.get('/embedding', async (req, res) => {
  const embeddingService = new EmbeddingService();
  const text = req.query.text as string || "The quick brown fox jumped over the lazy dog";
  const embedding = await embeddingService.generateEmbedding(text);
  res.json({ embedding });
});


app.get('/healthcheck', (req, res) => {
  res.status(200).send('OK');
});


app.get('/similarity', async (req, res) => {
  const embeddingService = new EmbeddingService();
  const text1 = req.query.text1 as string || "The quick brown fox jumped over the lazy dog";
  const text2 = req.query.text2 as string || "A fast dark-colored fox leaped over a sleepy canine";

  const embedding1 = await embeddingService.generateEmbedding(text1);
  const embedding2 = await embeddingService.generateEmbedding(text2);
  if (!embedding1 || !embedding2) {
    return res.status(400).send('Failed to generate embeddings');
  }

  try {
    const similarity = cosineSimilarity(embedding1, embedding2);
    res.json({ similarity });
  } catch (error) {
    res.status(400).send((error as Error).message);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});