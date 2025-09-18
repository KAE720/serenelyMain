import AsyncStorage from '@react-native-async-storage/async-storage';

// Safely import llama.rn with error handling
let Llama = null;
try {
    const llamaModule = require('llama.rn');
    Llama = llamaModule.Llama;
} catch (error) {
    console.warn('⚠️ llama.rn not available:', error.message);
    console.log('🎯 Will use fallback AI service instead');
}

let model;
let isInitializing = false;
let initializationPromise = null;

// Performance and usage tracking
const PERFORMANCE_KEY = 'phi2_performance';
const USAGE_KEY = 'phi2_usage';
const MAX_FREE_QUERIES = 50; // Free tier limit

export async function initLocalLLM() {
    if (model) return true;

    // Check if Llama is available
    if (!Llama) {
        console.log('🎯 Llama.rn not available, skipping model load');
        return false;
    }

    if (isInitializing) {
        return initializationPromise;
    }

    isInitializing = true;
    initializationPromise = new Promise(async (resolve) => {
        try {
            console.log('🧠 Loading Phi-2 model...');
            const startTime = Date.now();

            model = await Llama.load('assets/models/phi-2.Q2_K.gguf', {
                gpu: false,
                maxTokens: 150,
                temperature: 0.6,
                topK: 40,
                topP: 0.9
            });

            const loadTime = Date.now() - startTime;
            console.log(`✅ Phi-2 loaded successfully in ${loadTime}ms`);

            // Store performance metrics
            await AsyncStorage.setItem(PERFORMANCE_KEY, JSON.stringify({
                lastLoadTime: loadTime,
                modelLoaded: true,
                timestamp: new Date().toISOString()
            }));

            isInitializing = false;
            resolve(true);
        } catch (error) {
            console.error('❌ Phi-2 load failed:', error);
            isInitializing = false;
            resolve(false);
        }
    });

    return initializationPromise;
}

export async function queryLocalLLM(message, queryType = 'summary') {
    if (!model && !await initLocalLLM()) {
        console.warn('🚫 AI unavailable, using fallback');
        return getFallbackResponse(message, queryType);
    }

    // If model is still null after init, use fallback
    if (!model) {
        console.warn('🎯 Model not loaded, using fallback');
        return getFallbackResponse(message, queryType);
    }

    // Check usage limits for free tier
    const canQuery = await checkUsageLimit();
    if (!canQuery) {
        return 'Free AI queries exhausted. Upgrade for unlimited access.';
    }

    const prompts = {
        sentiment: `Analyze the emotional tone of this message and respond with EXACTLY ONE WORD from: positive, negative, or neutral.

Message: "${message}"

Response:`,

        summary: `Provide a brief, clear summary of what this message is saying. Be concise and focus on the main point or emotion.

Message: "${message}"

Summary:`,

        cbt: `You are Serine, a compassionate CBT therapist. Respond supportively to help reframe negative thoughts and provide actionable guidance. Keep responses under 2 sentences.

User: "${message}"

Serine:`,

        explanation: `Explain what this message means and what emotion it conveys. Be helpful and understanding.

Message: "${message}"

Explanation:`
    };

    const prompt = prompts[queryType] || prompts.summary;

    try {
        const startTime = Date.now();
        console.log(`🤖 Querying Phi-2 for ${queryType}...`);

        const response = await model.infer(prompt, {
            maxTokens: queryType === 'cbt' ? 100 : 80,
            temperature: queryType === 'sentiment' ? 0.3 : 0.7,
            stopSequences: ['\n\n', 'User:', 'Message:']
        });

        const inferenceTime = Date.now() - startTime;
        console.log(`✅ Phi-2 response in ${inferenceTime}ms`);

        // Track usage
        await incrementUsage(queryType, inferenceTime);

        const cleanResponse = response.trim();

        // Post-process sentiment responses
        if (queryType === 'sentiment') {
            return normalizeSentiment(cleanResponse);
        }

        return cleanResponse || getFallbackResponse(message, queryType);

    } catch (error) {
        console.error('🚫 Phi-2 inference error:', error);
        return getFallbackResponse(message, queryType);
    }
}

// Normalize sentiment output to ensure consistency
function normalizeSentiment(response) {
    const lower = response.toLowerCase();
    if (lower.includes('positive') || lower.includes('happy') || lower.includes('good')) {
        return 'positive';
    } else if (lower.includes('negative') || lower.includes('sad') || lower.includes('angry') || lower.includes('bad')) {
        return 'negative';
    } else {
        return 'neutral';
    }
}

// Fallback responses when AI is unavailable
function getFallbackResponse(message, queryType) {
    switch (queryType) {
        case 'sentiment':
            // Simple keyword-based sentiment analysis
            const lowerMsg = message.toLowerCase();
            if (lowerMsg.includes('love') || lowerMsg.includes('happy') || lowerMsg.includes('great') || lowerMsg.includes('awesome')) {
                return 'positive';
            } else if (lowerMsg.includes('hate') || lowerMsg.includes('angry') || lowerMsg.includes('terrible') || lowerMsg.includes('awful')) {
                return 'negative';
            }
            return 'neutral';

        case 'summary':
            return message.length > 50 ? `Summary: ${message.substring(0, 50)}...` : `Summary: ${message}`;

        case 'cbt':
            return "I'm here to listen. Sometimes taking a step back and breathing can help us see things differently.";

        case 'explanation':
            return "This message expresses the sender's thoughts and feelings.";

        default:
            return 'AI analysis unavailable';
    }
}

// Usage tracking for free tier limits
async function checkUsageLimit() {
    try {
        const usage = await AsyncStorage.getItem(USAGE_KEY);
        if (!usage) return true;

        const usageData = JSON.parse(usage);
        const today = new Date().toDateString();

        if (usageData.date !== today) {
            // Reset daily count
            return true;
        }

        return usageData.count < MAX_FREE_QUERIES;
    } catch (error) {
        console.error('Usage check error:', error);
        return true; // Allow on error
    }
}

async function incrementUsage(queryType, inferenceTime) {
    try {
        const today = new Date().toDateString();
        let usageData = { date: today, count: 0, queries: [] };

        const existing = await AsyncStorage.getItem(USAGE_KEY);
        if (existing) {
            const parsed = JSON.parse(existing);
            if (parsed.date === today) {
                usageData = parsed;
            }
        }

        usageData.count += 1;
        usageData.queries.push({
            type: queryType,
            time: inferenceTime,
            timestamp: new Date().toISOString()
        });

        await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(usageData));
    } catch (error) {
        console.error('Usage tracking error:', error);
    }
}

// Get color for sentiment-based bubble coloring
export function getSentimentColor(sentiment) {
    const colors = {
        positive: '#2AB67B',  // Teal-ish green (matches your app theme)
        negative: '#E63946',  // Vivid red (matches your app theme)
        neutral: '#2D6CDF'    // Medium vibrant blue (matches your app theme)
    };
    return colors[sentiment] || colors.neutral;
}

// Performance and usage stats for debugging
export async function getAIStats() {
    try {
        const [performance, usage] = await Promise.all([
            AsyncStorage.getItem(PERFORMANCE_KEY),
            AsyncStorage.getItem(USAGE_KEY)
        ]);

        return {
            performance: performance ? JSON.parse(performance) : null,
            usage: usage ? JSON.parse(usage) : null,
            modelLoaded: !!model
        };
    } catch (error) {
        console.error('Stats error:', error);
        return { performance: null, usage: null, modelLoaded: !!model };
    }
}

// Reset usage (for testing or premium users)
export async function resetUsage() {
    try {
        await AsyncStorage.removeItem(USAGE_KEY);
        console.log('Usage stats reset');
    } catch (error) {
        console.error('Reset usage error:', error);
    }
}

// CBT-specific helper for therapist mode
export async function getCBTResponse(userInput) {
    const response = await queryLocalLLM(userInput, 'cbt');

    // Add helpful CBT techniques as suggestions
    const techniques = [
        "Try the 5-4-3-2-1 grounding technique: 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste.",
        "Challenge that thought: Is it really true? What evidence supports or contradicts it?",
        "Practice self-compassion: What would you tell a good friend in this situation?",
        "Take three deep breaths and notice how your body feels right now.",
        "Remember: Feelings are temporary visitors, not permanent residents."
    ];

    const randomTechnique = techniques[Math.floor(Math.random() * techniques.length)];

    return {
        response,
        technique: randomTechnique,
        timestamp: new Date().toISOString()
    };
}

// Cleanup function
export function cleanup() {
    if (model) {
        model = null;
        console.log('🧹 Phi-2 model cleaned up');
    }
}
