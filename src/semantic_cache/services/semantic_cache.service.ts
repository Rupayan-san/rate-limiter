import { embeddingToBuffer } from "../utils/vector.utils.js";
import type { RedisClientType } from "redis";
import crypto from "crypto";
import { CACHE_SIMILARITY_THRESHOLD } from "../config/semantic_cache.config.js";
import type { LLMProvider } from "../../interfaces/llm.interface.js";
import type { EmbeddingProvider } from "../../interfaces/embedding.interface.js";



type SemanticCacheOptions = {
    client: RedisClientType;
    embeddingProvider: EmbeddingProvider;
    llmProvider: LLMProvider;
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
    private embeddingProvider: EmbeddingProvider;
    private llmProvider: LLMProvider;
    private threshold: number;

    constructor(options: SemanticCacheOptions) {
        this.client = options.client;
        this.embeddingProvider = options.embeddingProvider;
        this.llmProvider = options.llmProvider;
        this.threshold = options.threshold ?? CACHE_SIMILARITY_THRESHOLD;
    }

    private async createCacheService(
        query: string,
        response: string, 
    ) {
        const cacheId = crypto.randomUUID();
        
        const embedding = await this.embeddingProvider.generateEmbedding(query);
        const embeddingBuffer = embeddingToBuffer(embedding);

        await this.client.hSet(`semantic_cache:${cacheId}`, {
            query,
            response,
            embedding: embeddingBuffer,
        });
    }

    private async getCacheService(cache_id: string, client: RedisClientType) {
        const cacheEntry = await client.hGetAll(`semantic_cache:${cache_id}`);
        return cacheEntry;
    }

    private async searchCacheService(query: string) {
        const embedding = await this.embeddingProvider.generateEmbedding(query);
        const embeddingBuffer = embeddingToBuffer(embedding);
        
        const result = await this.client.sendCommand([
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

    private isCacheHit(similarityScore: number) {
        return similarityScore >= this.threshold;
    }

    public async getCachedOrGenerate(query: string) {
        const cacheEntry = await this.searchCacheService(query);
        
        if (cacheEntry && this.isCacheHit(cacheEntry.similarityScore)) {
            console.log("cachehit");
            return cacheEntry.response;
        }
        console.log("cachemiss");
        
        const response = await this.llmProvider.askLLM(query);
        await this.createCacheService(query, response);
        return response;
    }
}

export { 
    SemanticCache
};