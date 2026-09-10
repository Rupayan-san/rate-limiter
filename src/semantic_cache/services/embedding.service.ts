import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
console.log("Before EmbeddingService:", !!process.env.OPENAI_API_KEY);

class EmbeddingService {
    private client: OpenAI;

    constructor() {
        this.client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    public async generateEmbedding(text: string): Promise<number[]> {
        const response = await this.client.embeddings.create({
            model: "text-embedding-3-large",
            input: text,
        });

        const embedding = response.data[0]?.embedding as number[] || [];
        
        return embedding;
    }
}

export { EmbeddingService };