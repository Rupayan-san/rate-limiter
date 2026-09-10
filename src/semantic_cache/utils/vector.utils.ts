export function embeddingToBuffer(embedding: number[]): Buffer {
    const float32Embedding = new Float32Array(embedding);

    return Buffer.from(float32Embedding.buffer);
}