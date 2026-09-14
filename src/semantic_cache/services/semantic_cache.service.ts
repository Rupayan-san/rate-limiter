import { EmbeddingService } from "./embedding.service.js";
import { embeddingToBuffer } from "../utils/vector.utils.js";
import type { RedisClientType } from "redis";
import crypto from "crypto";
import { CACHE_SIMILARITY_THRESHOLD } from "../config/semantic_cache.config.js";
import { LLMService } from "./llm.service.js";


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


async function createCacheService(query: string, response: string, client: RedisClientType) {
    const cacheId = crypto.randomUUID();
    
    const embeddingService = new EmbeddingService();
    const embedding = await embeddingService.generateEmbedding(query);
    const embeddingBuffer = embeddingToBuffer(embedding);

    await client.hSet(`semantic_cache:${cacheId}`, {
        query,
        response,
        embedding: embeddingBuffer,
    });

}


async function getCacheService(cache_id: string, client: RedisClientType) {

    const cacheEntry = await client.hGetAll(`semantic_cache:${cache_id}`);
    return cacheEntry;
}


async function searchCacheService(query: string, client: RedisClientType) {
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


function isCacheHit(similarityScore: number, threshold: number = CACHE_SIMILARITY_THRESHOLD){
    return  similarityScore >= threshold;
}


async function SemanticCache(query: string, client: RedisClientType){
    const cacheEntry = await searchCacheService(query, client);
    
    if (cacheEntry && isCacheHit(cacheEntry.similarityScore)) {
        console.log("cachehit");
        return cacheEntry.response;
    }
    console.log("cachemiss");

    const llmService = new LLMService();
    const response = await llmService.askLLM(query);
    await createCacheService(query, response, client);
    return response;
}




export { 
    createCacheService, 
    getCacheService, 
    searchCacheService,
    isCacheHit,
    SemanticCache
};