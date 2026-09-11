import { describe, expect, it } from "vitest";
import { LLMService } from "../services/llm.service.js";

describe("LLMService", () => {
    it("should generate a response from the LLM", async () => {
        const llmService = new LLMService();

        const response = await llmService.askLLM(
            "What is the capital of India?"
        );

        console.log(response);

        expect(response).toBeTruthy();
        expect(typeof response).toBe("string");
    });
});