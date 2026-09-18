# Request Guard

Redis-based rate limiting and semantic caching for Node.js applications.

## Features

* Token Bucket rate limiting
* Leaky Bucket rate limiting
* Sliding Window rate limiting
* Redis-backed state
* Semantic caching for LLM responses
* Pluggable LLM and embedding providers
* TypeScript support

## Installation

```bash
npm install request-guard
```

Make sure Redis is running and accessible from your application.

## Rate Limiting

### Using the Factory

```ts
import { createRateLimiter } from "request-guard";
import { createClient } from "redis";

const client = createClient({
  url: "redis://localhost:6379",
});

await client.connect();

const rateLimiter = createRateLimiter({
  algorithm: "token-bucket",
  capacity: 10,
  refillRate: 1,
  client,
});

const allowed = await rateLimiter.allowRequest("user-123");

console.log(allowed);
```

### Available Algorithms

#### Token Bucket

```ts
const rateLimiter = createRateLimiter({
  algorithm: "token-bucket",
  capacity: 10,
  refillRate: 1,
  client,
});
```

#### Leaky Bucket

```ts
const rateLimiter = createRateLimiter({
  algorithm: "leaky-bucket",
  capacity: 10,
  leakRate: 1,
  client,
});
```

#### Sliding Window

```ts
const rateLimiter = createRateLimiter({
  algorithm: "sliding-window",
  windowSize: 60,
  maxRequests: 10,
  client,
});
```

`windowSize` is specified in seconds.

## Semantic Cache

Semantic caching uses embeddings to determine whether a new query is sufficiently similar to a previously cached query.

```ts
import { SemanticCache } from "request-guard";

const cache = new SemanticCache({
  client,
  embeddingProvider,
  llmProvider,
  threshold: 0.6,
});

const response = await cache.getCachedOrGenerate(
  "Explain how Redis works"
);
```

If a sufficiently similar query exists in the cache, its response is returned instead of generating a new LLM response.

The default similarity threshold is `0.6`.

## Providers

The semantic cache does not depend on a specific AI provider. You provide implementations of the `EmbeddingProvider` and `LLMProvider` interfaces.

### Embedding Provider

```ts
interface EmbeddingProvider {
  generateEmbedding(text: string): Promise<number[]>;
}
```

### LLM Provider

```ts
interface LLMProvider {
  generateResponse(prompt: string): Promise<string>;
}
```

This allows the cache to work with different LLM and embedding providers.

## Direct Algorithm Usage

The individual algorithms can also be instantiated directly:

```ts
import { TokenBucket } from "rate-limiter";

const limiter = new TokenBucket(
  10,
  1,
  client
);

const allowed = await limiter.allowRequest("user-123");
```

## API

### `createRateLimiter(options)`

Creates a rate limiter using one of the supported algorithms:

* `token-bucket`
* `leaky-bucket`
* `sliding-window`

### `SemanticCache(options)`

Creates a semantic cache using the supplied Redis client, embedding provider, and LLM provider.

### `allowRequest(userId)`

Returns:

```ts
Promise<boolean>
```

`true` means the request is allowed. `false` means the request has exceeded the configured limit.

## License

ISC
