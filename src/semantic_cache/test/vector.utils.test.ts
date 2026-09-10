import { embeddingToBuffer } from "../utils/vector.utils.js";
import { describe, it, expect } from "vitest";

describe("Vector Utils Tests", () => {
    it("should convert embedding to buffer", async () => {
        const embedding = [1, 2, 3];
        const buffer = await embeddingToBuffer(embedding);
        expect(buffer).toBeInstanceOf(Buffer);
    });
});
