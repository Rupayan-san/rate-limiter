import { embeddingToBuffer } from "../utils/vector.utils.js";
import type { RedisClientType } from "redis";
import crypto from "crypto";
import { CACHE_SIMILARITY_THRESHOLD } from "../config/semantic_cache.config.js";
import type { LLMProvider } from "../../interfaces/llm.interface.js";
import type { EmbeddingProvider } from "../../interfaces/embedding.interface.js";



type SemanticCacheOptions = {
    client: RedisClientType;
    embeddingService: EmbeddingProvider;
    llmService: LLMProvider;
    threshold?: number;
};

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

    private async createCacheService(
        query: string,
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

    private async getCacheService(cache_id: string, client: RedisClientType) {
        const cacheEntry = await client.hGetAll(`semantic_cache:${cache_id}`);
        return cacheEntry;
    }

    private async searchCacheService(
        query: string, 
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

    private isCacheHit(similarityScore: number, threshold: number = CACHE_SIMILARITY_THRESHOLD) {
        return similarityScore >= threshold;
    }

    public async getCachedOrGenerate(
        query: string,
        client: RedisClientType,
        llm: LLMProvider,
        embeddingService: EmbeddingProvider,
    ) {
        const cacheEntry = await this.searchCacheService(query, client, embeddingService);
        
        if (cacheEntry && this.isCacheHit(cacheEntry.similarityScore)) {
            console.log("cachehit");
            return cacheEntry.response;
        }
        console.log("cachemiss");
        
        const response = await llm.askLLM(query);
        await this.createCacheService(query, response, client, embeddingService);
        return response;
    }
}

export { 
    SemanticCache
};