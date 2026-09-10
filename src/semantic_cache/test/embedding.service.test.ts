import "dotenv/config";
import { describe, it, expect } from "vitest";
import { EmbeddingService } from "../services/embedding.service.js";


describe("EmbeddingService", () => {
    it("should generate an embedding", async () => {
        const service = new EmbeddingService();

        const embedding = await service.generateEmbedding(
            "What is Redis?"
        );

        console.log("Dimensions:", embedding.length);
        console.log("First 5 values:", embedding.slice(0, 5));

        expect(embedding.length).toBeGreaterThan(0);
    }, 15000); // Set a timeout of 15 seconds for this test
});