// import { EmbeddingService } from "../services/embedding.service.js";
import { embeddingToBuffer } from "../utils/vector.utils.js";

// const embeddingService = new EmbeddingService();
// const embedding = await embeddingService.generateEmbedding("What is Redis?")

const embedding = [1, 2, 3];
const buffer = await embeddingToBuffer(embedding)

console.log("Buffer :", buffer);