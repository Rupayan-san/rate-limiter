export interface LLMProvider {
    askLLM(query: string): Promise<string>;
}