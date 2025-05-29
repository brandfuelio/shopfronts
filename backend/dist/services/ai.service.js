"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeReviewSentiment = exports.generateProductDescription = exports.processAIMessage = void 0;
const openai_1 = __importDefault(require("openai"));
const client_1 = require("@prisma/client");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
// Initialize OpenAI client
const openai = env_1.env.OPENAI_API_KEY ? new openai_1.default({
    apiKey: env_1.env.OPENAI_API_KEY,
}) : null;
const processAIMessage = async (sessionId, userMessage) => {
    try {
        // Check if AI is enabled
        if (!env_1.env.ENABLE_AI_CHAT || !openai) {
            return {
                content: "I'm sorry, but the AI assistant is currently unavailable. Please try again later.",
            };
        }
        // Get conversation history
        const messages = await prisma.chatMessage.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'asc' },
            take: 10, // Last 10 messages for context
        });
        // Get relevant products based on the message
        const products = await searchProducts(userMessage);
        // Build context
        const systemPrompt = buildSystemPrompt(products);
        const conversationHistory = messages.map(msg => ({
            role: msg.role,
            content: msg.content,
        }));
        // Call OpenAI
        const completion = await openai.chat.completions.create({
            model: env_1.env.AI_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                ...conversationHistory,
                { role: 'user', content: userMessage },
            ],
            max_tokens: env_1.env.AI_MAX_TOKENS,
            temperature: env_1.env.AI_TEMPERATURE,
        });
        const aiResponse = completion.choices[0]?.message?.content || "I couldn't generate a response.";
        // Extract product recommendations if any
        const recommendedProducts = extractProductRecommendations(aiResponse, products);
        return {
            content: aiResponse,
            metadata: {
                model: env_1.env.AI_MODEL,
                recommendedProducts,
                tokensUsed: completion.usage?.total_tokens,
            },
        };
    }
    catch (error) {
        logger_1.logger.error('AI processing error:', error);
        // Fallback response
        return {
            content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        };
    }
};
exports.processAIMessage = processAIMessage;
const buildSystemPrompt = (products) => {
    const basePrompt = env_1.env.AI_SYSTEM_PROMPT;
    if (products.length > 0) {
        const productList = products.map(p => `- ${p.name} ($${p.price}): ${p.description}`).join('\n');
        return `${basePrompt}

Available products that might be relevant:
${productList}

When recommending products, mention their key features and benefits. Be helpful and conversational.`;
    }
    return basePrompt;
};
const searchProducts = async (query) => {
    try {
        // Simple keyword search - in production, use proper search engine
        const keywords = query.toLowerCase().split(' ').filter(word => word.length > 3);
        if (keywords.length === 0)
            return [];
        const products = await prisma.product.findMany({
            where: {
                OR: [
                    {
                        name: {
                            contains: keywords[0],
                            mode: 'insensitive',
                        },
                    },
                    {
                        description: {
                            contains: keywords[0],
                            mode: 'insensitive',
                        },
                    },
                    {
                        category: {
                            name: {
                                contains: keywords[0],
                                mode: 'insensitive',
                            },
                        },
                    },
                ],
                status: 'ACTIVE',
            },
            include: {
                category: true,
            },
            take: 5,
        });
        return products;
    }
    catch (error) {
        logger_1.logger.error('Product search error:', error);
        return [];
    }
};
const extractProductRecommendations = (aiResponse, availableProducts) => {
    const recommendations = [];
    for (const product of availableProducts) {
        if (aiResponse.toLowerCase().includes(product.name.toLowerCase())) {
            recommendations.push({
                id: product.id,
                name: product.name,
                price: product.price,
            });
        }
    }
    return recommendations;
};
// Generate product descriptions using AI
const generateProductDescription = async (productName, features, category) => {
    if (!openai) {
        return `${productName} - A powerful tool in the ${category} category.`;
    }
    try {
        const prompt = `Write a compelling product description for "${productName}" which is a ${category} product with these features: ${features.join(', ')}. Keep it under 150 words and highlight the key benefits.`;
        const completion = await openai.chat.completions.create({
            model: env_1.env.AI_MODEL,
            messages: [
                { role: 'system', content: 'You are a professional copywriter for a digital marketplace.' },
                { role: 'user', content: prompt },
            ],
            max_tokens: 200,
            temperature: 0.7,
        });
        return completion.choices[0]?.message?.content || `${productName} - A powerful tool in the ${category} category.`;
    }
    catch (error) {
        logger_1.logger.error('Error generating product description:', error);
        return `${productName} - A powerful tool in the ${category} category.`;
    }
};
exports.generateProductDescription = generateProductDescription;
// Analyze customer sentiment
const analyzeReviewSentiment = async (reviewText) => {
    if (!openai) {
        return { sentiment: 'neutral', score: 0.5 };
    }
    try {
        const completion = await openai.chat.completions.create({
            model: env_1.env.AI_MODEL,
            messages: [
                {
                    role: 'system',
                    content: 'Analyze the sentiment of the following review and respond with only: positive, neutral, or negative'
                },
                { role: 'user', content: reviewText },
            ],
            max_tokens: 10,
            temperature: 0,
        });
        const sentiment = completion.choices[0]?.message?.content?.toLowerCase().trim();
        const validSentiments = ['positive', 'neutral', 'negative'];
        return {
            sentiment: validSentiments.includes(sentiment) ? sentiment : 'neutral',
            score: sentiment === 'positive' ? 0.8 : sentiment === 'negative' ? 0.2 : 0.5,
        };
    }
    catch (error) {
        logger_1.logger.error('Error analyzing sentiment:', error);
        return { sentiment: 'neutral', score: 0.5 };
    }
};
exports.analyzeReviewSentiment = analyzeReviewSentiment;
//# sourceMappingURL=ai.service.js.map