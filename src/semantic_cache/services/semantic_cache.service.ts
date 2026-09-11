import { EmbeddingService } from "./embedding.service.js";
import { embeddingToBuffer } from "../utils/vector.utils.js";
import { client } from "../../config/redis.config.js";
import { CACHE_SIMILARITY_THRESHOLD } from "../config/semantic_cache.config.js";

type SearchResult = {
    attributes: string[];
    format: string;
    results: {
        id: string;
        extra_attributes: {
            query: string;
            response: string;
            vector_score: string;
        };
        values: unknown[];
    }[];
    total_results: number;
    warning: string[];
};

async function createCacheService(cache_id: string, query: string, response: string) {
    const embeddingService = new EmbeddingService();
    const embedding = await embeddingService.generateEmbedding(query);
    const embeddingBuffer = embeddingToBuffer(embedding);

    await client.hSet(`semantic_cache:${cache_id}`, {
        query,
        response,
        embedding: embeddingBuffer,
    });
}

async function getCacheService(cache_id: string) {

    const cacheEntry = await client.hGetAll(`semantic_cache:${cache_id}`);
    return cacheEntry;
}

async function searchCacheService(query: string) {
    const embeddingService = new EmbeddingService();
    const embedding = await embeddingService.generateEmbedding(query);
    const embeddingBuffer = embeddingToBuffer(embedding);

    const result = await client.sendCommand([
        "FT.SEARCH",
        "semantic_cache_idx",
        "*=>[KNN 1 @embedding $query_vector AS vector_score]",
        "PARAMS",
        "2",
        "query_vector",
        embeddingBuffer,
        "SORTBY",
        "vector_score",
        "DIALECT",
        "2",
        "RETURN",
        "3",
        "query",
        "response",
        "vector_score",
    ]) as unknown as SearchResult;

    
    if (result.total_results === 0) {
        return null;
    }

    const cacheEntry = result.results[0];

    if (!cacheEntry) {
        return null;
    }

    const distance = Number(cacheEntry.extra_attributes.vector_score);

    const similarityScore = Math.max(
        0,
        Math.min(1, 1 - distance)
    );

    return {
        id: cacheEntry.id,
        query: cacheEntry.extra_attributes.query,
        response: cacheEntry.extra_attributes.response,
        similarityScore: similarityScore,
    };

}


async function thresholdCompare(similarityScore: number, threshold: number = CACHE_SIMILARITY_THRESHOLD){
    return  similarityScore >= threshold;
}


export { 
    createCacheService, 
    getCacheService, 
    searchCacheService,
    thresholdCompare
};