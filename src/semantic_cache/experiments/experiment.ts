import "dotenv/config";
import { EmbeddingService } from "../services/embedding.service.js";
import { cosineSimilarity } from "../utils/similarity.utils.js";
import { writeFileSync, appendFileSync, writeSync } from "fs";

// const testCases = [
//     // {
//     //     id: 1,
//     //     textA: "How do I reset my password?",
//     //     textB: "I forgot my password. How can I reset it?",
//     //     expected: "high",
//     // },
//     // {
//     //     id: 2,
//     //     textA: "How much does this product cost?",
//     //     textB: "What is the price of this product?",
//     //     expected: "high",
//     // },
//     // {
//     //     id: 3,
//     //     textA: "How can I cancel my subscription?",
//     //     textB: "I want to stop my subscription.",
//     //     expected: "high",
//     // },
//     // {
//     //     id: 4,
//     //     textA: "Where can I find my order?",
//     //     textB: "How do I track my order?",
//     //     expected: "high",
//     // },
//     // {
//     //     id: 5,
//     //     textA: "How do I reset my password?",
//     //     textB: "Where can I change my account password?",
//     //     expected: "medium",
//     // },
//     // {
//     //     id: 6,
//     //     textA: "How can I cancel my subscription?",
//     //     textB: "Can I get a refund for my subscription?",
//     //     expected: "medium",
//     // },
//     // {
//     //     id: 7,
//     //     textA: "How do I track my order?",
//     //     textB: "When will my package arrive?",
//     //     expected: "medium",
//     // },
//     // {
//     //     id: 8,
//     //     textA: "How do I reset my password?",
//     //     textB: "What is the weather today?",
//     //     expected: "low",
//     // },
//     // {
//     //     id: 9,
//     //     textA: "How much does this product cost?",
//     //     textB: "How do I make chocolate cake?",
//     //     expected: "low",
//     // },
//     // {
//     //     id: 10,
//     //     textA: "How do I track my order?",
//     //     textB: "Who won the football match?",
//     //     expected: "low",
//     // },
//     // {
//     //     id: 11,
//     //     textA: "How do I reset my password?",
//     //     textB: "How do I change my email address?",
//     //     expected: "low",
//     // },
//     {
//         id: 12,
//         textA: "How do I reset my password?",
//         textB: "I can't remember my password. How can I create a new one?",
//         expected: "high",
//     },
//     {
//         id: 13,
//         textA: "How do I reset my password?",
//         textB: "What are the steps to reset a forgotten password?",
//         expected: "high",
//     },
//     {
//         id: 14,
//         textA: "How much does this product cost?",
//         textB: "What is the price of this item?",
//         expected: "high",
//     },
//     {
//         id: 15,
//         textA: "How can I cancel my subscription?",
//         textB: "How do I stop my current subscription?",
//         expected: "high",
//     },
//     {
//         id: 16,
//         textA: "How do I track my order?",
//         textB: "Where can I see the status of my order?",
//         expected: "high",
//     },
//     {
//         id: 17,
//         textA: "How do I reset my password?",
//         textB: "How long does a password reset take?",
//         expected: "medium",
//     },
//     {
//         id: 18,
//         textA: "How do I reset my password?",
//         textB: "Why isn't my password reset email arriving?",
//         expected: "medium",
//     },
//     {
//         id: 19,
//         textA: "How can I cancel my subscription?",
//         textB: "What happens after I cancel my subscription?",
//         expected: "medium",
//     },
//     {
//         id: 20,
//         textA: "How can I cancel my subscription?",
//         textB: "Will I get charged if I cancel my subscription?",
//         expected: "medium",
//     },
//     {
//         id: 21,
//         textA: "How do I track my order?",
//         textB: "How long will delivery take?",
//         expected: "medium",
//     },
//     {
//         id: 22,
//         textA: "How do I reset my password?",
//         textB: "How do I cook pasta?",
//         expected: "low",
//     },
//     {
//         id: 23,
//         textA: "How much does this product cost?",
//         textB: "What programming language should I learn?",
//         expected: "low",
//     },
//     {
//         id: 24,
//         textA: "How can I cancel my subscription?",
//         textB: "What is the capital of France?",
//         expected: "low",
//     },
//     {
//         id: 25,
//         textA: "How do I track my order?",
//         textB: "How does photosynthesis work?",
//         expected: "low",
//     },
//     {
//         id: 26,
//         textA: "How do I reset my password?",
//         textB: "Who won the last World Cup?",
//         expected: "low",
//     },
//     {
//         id: 27,
//         textA: "How do I reset my password?",
//         textB: "Why should I reset my password?",
//         expected: "medium",
//     },
//     {
//         id: 28,
//         textA: "How do I change my email address?",
//         textB: "Why can't I change my email address?",
//         expected: "medium",
//     },
//     {
//         id: 29,
//         textA: "How do I cancel my subscription?",
//         textB: "Can I pause my subscription instead of cancelling it?",
//         expected: "medium",
//     },
//     {
//         id: 30,
//         textA: "Where can I find my order?",
//         textB: "Can I change the delivery address for my order?",
//         expected: "medium",
//     },
//     {
//         id: 31,
//         textA: "How much does this product cost?",
//         textB: "Does this product have a discount?",
//         expected: "medium",
//     },
//     {
//         id: 32,
//         textA: "I forgot my password.",
//         textB: "I can't log into my account because I don't remember my password.",
//         expected: "high",
//     },
//     {
//         id: 33,
//         textA: "I want to stop paying for this service.",
//         textB: "How do I cancel my subscription?",
//         expected: "high",
//     },
//     {
//         id: 34,
//         textA: "Where is my package?",
//         textB: "Can you tell me the current status of my order?",
//         expected: "high",
//     },
//     {
//         id: 35,
//         textA: "What's the price of this?",
//         textB: "How much do I have to pay for this product?",
//         expected: "high",
//     },
// ];

    // {
    //     id: 4,
    //     intent: "cancel_subscription",
    //     reference: "How can I cancel my subscription?",
    //     variations: [
    //         "How do I get a refund?",
    //         "How do I change my account password?",
    //         "How do I update my email address?",
    //         "How do I track my order?",
    //     ],
    // },

    // {
    //     id: 3,
    //     intent: "reset_password",
    //     reference:" How do I reset my password?",
    //     variations: [
    //         "How do I change my email address?",
    //         "How do I delete my account?",
    //         "Why can't I log into my account?",
    //         "How do I update my profile?"
    //     ]
    // }

const testCases = [
        
    {
        intent: "reset_password",
        reference: "How do I reset my password?",
        variations: [
            // Same intent
            {text: "I forgot my password. How can I reset it?", type: "same"},
            {text: "What are the steps to reset a forgotten password?", type: "same"},
            {text: "I can't remember my password. How do I create a new one?", type: "same"},
            {text: "I need to change my forgotten password.", type: "same"},

            // Different intent
            {text: "How do I change my email address?", type: "different"},
            {text: "How do I delete my account?", type: "different"},
            {text: "Why can't I log into my account?", type: "different"},
            {text: "How do I update my profile?", type: "different"},
        ],
    },

    {
        intent: "cancel_subscription",
        reference: "How can I cancel my subscription?",
        variations: [
            // Same intent
            {text: "I want to stop my subscription.", type: "same"},
            {text: "How do I end my subscription?", type: "same"},
            {text: "I don't want my subscription anymore.", type: "same"},
            {text: "How can I terminate my subscription?", type: "same"},

            // Different intent
            {text: "How do I get a refund?", type: "different"},
            {text: "How do I change my account password?", type: "different"},
            {text: "How do I update my email address?", type: "different"},
            {text: "How do I track my order?", type: "different"},
        ],
    },

    {
        intent: "track_order",
        reference: "How do I track my order?",
        variations: [
            { text: "Where can I see the status of my order?", type: "same" },
            { text: "How can I check where my package is?", type: "same" },
            { text: "Where is my order right now?", type: "same" },
            { text: "Can I track my package?", type: "same" },

            { text: "How do I cancel my order?", type: "different" },
            { text: "How can I change my delivery address?", type: "different" },
            { text: "How long does shipping take?", type: "different" },
            { text: "How do I request a refund?", type: "different" },
        ],
    },

    {
        intent: "change_email",
        reference: "How do I change my email address?",
        variations: [
            // Same intent
            { text: "I want to update the email on my account.", type: "same" },
            { text: "How can I change my account email?", type: "same" },
            { text: "Where can I update my email address?", type: "same" },
            { text: "I need to replace my current email address.", type: "same" },

            // Different intent
            { text: "How do I reset my password?", type: "different" },
            { text: "How do I delete my account?", type: "different" },
            { text: "How do I change my username?", type: "different" },
            { text: "Why can't I log into my account?", type: "different" },
        ],
    },

    {
        intent: "product_price",
        reference: "How much does this product cost?",
        variations: [
            // Same intent
            { text: "What is the price of this product?", type: "same" },
            { text: "How much is this item?", type: "same" },
            { text: "What does this product cost?", type: "same" },
            { text: "Can you tell me the price of this item?", type: "same" },

            // Different intent
            { text: "How do I order this product?", type: "different" },
            { text: "Is this product available?", type: "different" },
            { text: "How long will delivery take?", type: "different" },
            { text: "Can I return this product?", type: "different" },
        ],
    },
];




const embeddingService = new EmbeddingService();

const results: {
    reference: string;
    variation: string;
    similarity: number;
    type: string;
}[] = [];

for (const testCase of testCases) {
    const embeddingA = await embeddingService.generateEmbedding(testCase.reference);
    for (const variation of testCase.variations) {
        const embeddingB = await embeddingService.generateEmbedding(variation.text);
        const similarity = cosineSimilarity(embeddingA, embeddingB);
        
        console.log({
            similarity,
        });
        results.push({
            reference: testCase.reference,
            variation: variation.text,
            similarity,
            type: variation.type
        });
    }
}


const thresholds = [0.55, 0.6, 0.65, 0.7, 0.75, 0.8];

for (const threshold of thresholds) {
    let trueHits = 0;
    let falseHits = 0;
    let trueMisses = 0;
    let falseMisses = 0;

    for (const result of results) {
        const predictedHit = result.similarity >= threshold;

        if (result.type === "same") {
            if (predictedHit) {
                trueHits++;
            } else {
                falseMisses++;
            }
        } else {
            if (predictedHit) {
                falseHits++;
            } else {
                trueMisses++;
            }
        }
    }

    const precision =
        trueHits + falseHits === 0
            ? 0
            : trueHits / (trueHits + falseHits);

    const recall =
        trueHits + falseMisses === 0
            ? 0
            : trueHits / (trueHits + falseMisses);

    console.log("\n-------------------------");
    console.log("Threshold:", threshold);
    console.log("True Hits:", trueHits);
    console.log("False Hits:", falseHits);
    console.log("True Misses:", trueMisses);
    console.log("False Misses:", falseMisses);
    console.log("Precision:", precision.toFixed(3));
    console.log("Recall:", recall.toFixed(3));
}

const csv = [
    "reference,variation,type,similarity",
    ...results.map(
        (result) =>
            `"${result.reference}","${result.variation}","${result.type}",${result.similarity}`
    ),
].join("\n");

writeFileSync("src/semantic_cache/similarity-results.csv", csv);