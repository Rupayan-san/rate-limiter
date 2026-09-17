import { embeddingToBuffer } from "../utils/vector.utils.js";
import type { RedisClientType } from "redis";
import crypto from "crypto";
import { CACHE_SIMILARITY_THRESHOLD } from "../config/semantic_cache.config.js";
import { LLMService } from "./llm.service.js";
import type { LLMProvider } from "../../interfaces/llm.interface.js";
import type { EmbeddingProvider } from "../../interfaces/embedding.interface.js";
import type { EmbeddingService } from "./embedding.service.js";



type SemanticCacheOptions = {
    client: RedisClientType;
    embeddingService: EmbeddingProvider;
    llmService: LLMProvider;
    threshold?: number;
};

class SemanticCache {
    private client: RedisClientType;
    private embeddingService: EmbeddingProvider;
    private llmService: LLMProvider;
    private threshold: number;

    constructor(options: SemanticCacheOptions) {
        this.client = options.client;
        this.embeddingService = options.embeddingService;
        this.llmService = options.llmService;
        this.threshold = options.threshold ?? CACHE_SIMILARITY_THRESHOLD;
    }
}


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


async function createCacheService(query: string,
    response: string, 
    client: RedisClientType,
    embeddingService: EmbeddingProvider
) {
    const cacheId = crypto.randomUUID();
    
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


async function searchCacheService(query: string, 
    client: RedisClientType,
    embeddingService: EmbeddingProvider
) {
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


async function getCachedOrGenerate(query: string,
    client: RedisClientType,
    llm: LLMProvider,
    embeddingService: EmbeddingProvider,
) {
    const cacheEntry = await searchCacheService(query, client, embeddingService);
    
    if (cacheEntry && isCacheHit(cacheEntry.similarityScore)) {
        console.log("cachehit");
        return cacheEntry.response;
    }
    console.log("cachemiss");

    const response = await llm.askLLM(query);
    await createCacheService(query, response, client, embeddingService);
    return response;
}




export { 
    createCacheService, 
    getCacheService, 
    searchCacheService,
    isCacheHit,
    getCachedOrGenerate
};