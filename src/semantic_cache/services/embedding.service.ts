import { client } from "../config/openai.config.js";
import OpenAI from "openai";


class EmbeddingService {
    private client: OpenAI;

    constructor() {
        this.client = client;
    }

    public async generateEmbedding(text: string): Promise<number[]> {
        const response = await this.client.embeddings.create({
            model: "text-embedding-3-large",
            input: text,
        });

        const embedding = response.data[0]?.embedding as number[];
        
        return embedding;
    }
}

export { EmbeddingService };