import { client } from "../config/openai.config.js";
import OpenAI from "openai";


class LLMService {
    private client: OpenAI;

    constructor() {
        this.client = client;
    }

    public async askLLM(query: string): Promise<string>  {
        const response = await this.client.chat.completions.create({
            model: "gpt-5-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant.",
                },
                {
                    role: "user",
                    content: query,
                },
            ],
        });

        const choice = response.choices[0];

        if (!choice) {
            throw new Error("LLM returned no response");
        }

        return choice.message.content ?? "";
    }
}

export { LLMService };