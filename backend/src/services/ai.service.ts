import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Initialize OpenAI client
const openai = env.OPENAI_API_KEY ? new OpenAI({
  apiKey: env.OPENAI_API_KEY,
}) : null;

interface AIResponse {
  content: string;
  metadata?: any;
}

export const processAIMessage = async (sessionId: string, userMessage: string): Promise<AIResponse> => {
  try {
    // Check if AI is enabled
    if (!env.ENABLE_AI_CHAT || !openai) {
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
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: env.AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: userMessage },
      ],
      max_tokens: env.AI_MAX_TOKENS,
      temperature: env.AI_TEMPERATURE,
    });

    const aiResponse = completion.choices[0]?.message?.content || "I couldn't generate a response.";

    // Extract product recommendations if any
    const recommendedProducts = extractProductRecommendations(aiResponse, products);

    return {
      content: aiResponse,
      metadata: {
        model: env.AI_MODEL,
        recommendedProducts,
        tokensUsed: completion.usage?.total_tokens,
      },
    };

  } catch (error) {
    logger.error('AI processing error:', error);
    
    // Fallback response
    return {
      content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
    };
  }
};

const buildSystemPrompt = (products: any[]): string => {
  const basePrompt = env.AI_SYSTEM_PROMPT;
  
  if (products.length > 0) {
    const productList = products.map(p => 
      `- ${p.name} ($${p.price}): ${p.description}`
    ).join('\n');

    return `${basePrompt}

Available products that might be relevant:
${productList}

When recommending products, mention their key features and benefits. Be helpful and conversational.`;
  }

  return basePrompt;
};

const searchProducts = async (query: string): Promise<any[]> => {
  try {
    // Simple keyword search - in production, use proper search engine
    const keywords = query.toLowerCase().split(' ').filter(word => word.length > 3);
    
    if (keywords.length === 0) return [];

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
  } catch (error) {
    logger.error('Product search error:', error);
    return [];
  }
};

const extractProductRecommendations = (aiResponse: string, availableProducts: any[]): any[] => {
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
export const generateProductDescription = async (
  productName: string,
  features: string[],
  category: string
): Promise<string> => {
  if (!openai) {
    return `${productName} - A powerful tool in the ${category} category.`;
  }

  try {
    const prompt = `Write a compelling product description for "${productName}" which is a ${category} product with these features: ${features.join(', ')}. Keep it under 150 words and highlight the key benefits.`;

    const completion = await openai.chat.completions.create({
      model: env.AI_MODEL,
      messages: [
        { role: 'system', content: 'You are a professional copywriter for a digital marketplace.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || `${productName} - A powerful tool in the ${category} category.`;
  } catch (error) {
    logger.error('Error generating product description:', error);
    return `${productName} - A powerful tool in the ${category} category.`;
  }
};

// Analyze customer sentiment
export const analyzeReviewSentiment = async (reviewText: string): Promise<{
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
}> => {
  if (!openai) {
    return { sentiment: 'neutral', score: 0.5 };
  }

  try {
    const completion = await openai.chat.completions.create({
      model: env.AI_MODEL,
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

    const sentiment = completion.choices[0]?.message?.content?.toLowerCase().trim() as any;
    const validSentiments = ['positive', 'neutral', 'negative'];
    
    return {
      sentiment: validSentiments.includes(sentiment) ? sentiment : 'neutral',
      score: sentiment === 'positive' ? 0.8 : sentiment === 'negative' ? 0.2 : 0.5,
    };
  } catch (error) {
    logger.error('Error analyzing sentiment:', error);
    return { sentiment: 'neutral', score: 0.5 };
  }
};