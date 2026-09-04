import { describe, expect, it } from "vitest";
import { cosineSimilarity } from "../similarity.js";

describe("cosineSimilarity", () => {
    it("should return 1 for identical vectors", () => {
        const a = [1, 2, 3];
        const b = [1, 2, 3];

        const result = cosineSimilarity(a, b);

        expect(result).toBeCloseTo(1);
    });
    

    it("should return 0 for orthogonal vectors", () => {
        const a = [1, 0];
        const b = [0, 1];

        const result = cosineSimilarity(a, b);

        expect(result).toBeCloseTo(0);
    });


    it("should return -1 for opposite vectors", () => {
        const a = [1, 0];
        const b = [-1, 0];

        const result = cosineSimilarity(a, b);

        expect(result).toBeCloseTo(-1);
    });


    it("should throw an error for vectors with different dimensions", () => {
        const a = [1, 2, 3];
        const b = [1, 2];

        expect(() => cosineSimilarity(a, b)).toThrow(
            "Vectors must have the same dimensions"
        );
    });


    it("should throw an error for zero vectors", () => {
        const a = [0, 0, 0];
        const b = [1, 2, 3];

        expect(() => cosineSimilarity(a, b)).toThrow(
            "Cannot calculate similarity for zero vectors"
        );
    });
});