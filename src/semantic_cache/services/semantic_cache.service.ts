import { EmbeddingService } from "./embedding.service.js";
import { embeddingToBuffer } from "../utils/vector.utils.js";
import { client } from "../../config/redis.config.js";

async function createCacheService() {
    const embeddingService = new EmbeddingService();
    const embedding = await embeddingService.generateEmbedding("How do I reset my password?");
    const embeddingBuffer = await embeddingToBuffer(embedding);

    await client.hSet("semantic_cache:123", {
        query: "How do I reset my password?",
        response: "Go to Settings...",
        embedding: embeddingBuffer,
    });
}

async function getCacheService(cache_id: string) {

    const cacheEntry = await client.hGetAll(`semantic_cache:${cache_id}`);
    return cacheEntry;
}

export { createCacheService, getCacheService };