// LLMUnifiedService.js - Combines emotion analysis, message explanation, local AI, and mood tracking
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Emotion Classification Engine ---
class EmotionClassificationEngine {
    constructor() {
        this.emotionPatterns = {
            angry: {
                keywords: ['angry', 'furious', 'mad', 'annoyed', 'irritated', 'frustrated', 'pissed', 'rage', 'hate'],
                phrases: [
                    'not happy with you', 'disappointed in you', 'what is wrong with you',
                    'this is ridiculous', 'fed up with', 'sick of', 'had enough',
                    'angry with you', 'mad at you', 'upset with you'
                ],
                contextualClues: [
                    'why did you not', "why didn't you", 'why did you', 'you should have', 'you never',
                    'always forget', 'never listen', "don't care", 'with you', 'at you'
                ],
                intensifiers: ['very', 'extremely', 'really', 'so', 'absolutely'],
                negationHandling: true
            },
            stressed: {
                keywords: ['stressed', 'overwhelmed', 'anxious', 'worried', 'pressure', 'tense', 'nervous', 'panic'],
                phrases: [
                    'feeling overwhelmed', "too much to handle", "can't cope", 'breaking point',
                    'under pressure', 'losing sleep', "can't focus"
                ],
                contextualClues: [
                    'work is', 'deadlines', 'boss', 'exam', 'bills', 'money problems',
                    'health issues', 'family problems'
                ],
                sadnessIndicators: ['sad', 'down', 'depressed', 'lonely', 'crying', 'tears'],
                intensifiers: ['extremely', 'really', 'very', 'so much', 'totally']
            },
            excited: {
                keywords: ['excited', 'happy', 'amazing', 'wonderful', 'fantastic', 'great', 'awesome', 'love', 'good', 'nice', 'cool'],
                phrases: [
                    'so happy', "can't wait", 'love you', 'thank you', 'appreciate',
                    "you're the best", 'feel great', 'amazing news', 'happy now', 'feeling good'
                ],
                contextualClues: [
                    'celebration', 'party', 'vacation', 'promotion', 'good news',
                    'achievement', 'success', 'wedding', 'birthday', 'watch', 'fun'
                ],
                emoticons: ['😍', '💕', '❤️', '😊', '😃', '🎉', '✨', '💖'],
                intensifiers: ['absolutely', 'totally', 'completely', 'so much', 'incredibly']
            },
            neutral: {
                indicators: ['okay', 'fine', 'alright', 'sure', 'maybe', 'perhaps', 'possibly'],
                questions: ['what', 'how', 'when', 'where', 'who', 'why'],
                statements: ['i think', 'in my opinion', 'it seems', 'apparently', 'according to']
            }
        };
    }
    analyzeEmotion(text) {
        // Basic fallback implementation for now
        if (!text || typeof text !== 'string') {
            return { emotion: 'neutral', confidence: 0.5, color: getSentimentColor('neutral') };
        }
        // Example: simple keyword-based detection
        const lower = text.toLowerCase();
        let emotion = 'neutral';
        if (lower.includes('happy') || lower.includes('love') || lower.includes('great')) {
            emotion = 'excited';
        } else if (lower.includes('angry') || lower.includes('hate') || lower.includes('mad')) {
            emotion = 'angry';
        } else if (lower.includes('stressed') || lower.includes('anxious') || lower.includes('worried')) {
            emotion = 'stressed';
        }
        const color = getSentimentColor(emotion);
        return { emotion, confidence: 0.8, color };
    }
    // ...other methods from llmService.js...
}

// --- Message Explanation Engine ---
class MessageExplanationEngine {
    constructor() { }
    generateExplanation(text, emotionAnalysis) {
        // ...existing code from llmService.js...
    }
    // ...other methods from llmService.js...
}

// --- Mood Tracking Service ---
class MoodTrackingService {
    constructor() {
        this.initialized = false;
        this.conversationScores = new Map();
        this.baseScore = 50;
        this.init();
    }
    init() { this.initialized = true; }
    calculateMessagePoints(emotion, confidence = 0.8) {
        // ...existing code from moodTrackingService.js...
    }
    updateConversationScore(conversationId, senderId, emotion, confidence) {
        // ...existing code from moodTrackingService.js...
    }
    getHealthStatus(score) {
        // ...existing code from moodTrackingService.js...
    }
    getRecommendation(score, emotion, points) {
        // ...existing code from moodTrackingService.js...
    }
    getConversationScore(conversationId) {
        // ...existing code from moodTrackingService.js...
    }
    getTrackerPosition(score, perspective = 'user') {
        // ...existing code from moodTrackingService.js...
    }
    resetConversation(conversationId) {
        // ...existing code from moodTrackingService.js...
    }
    getStatistics(conversationId) {
        // ...existing code from moodTrackingService.js...
    }
}

// --- Local LLM Service ---
function normalizeSentiment(response) {
    // ...existing code from localLLMService.js...
}
function getFallbackResponse(message, queryType) {
    // ...existing code from localLLMService.js...
}
export function getSentimentColor(sentiment) {
    const colors = {
        positive: '#28A745',
        negative: '#DC3545',
        neutral: '#007BFF'
    };
    return colors[sentiment] || colors.neutral;
}

// --- Main Unified Service ---
class LLMUnifiedService {
    constructor() {
        this.emotionEngine = new EmotionClassificationEngine();
        this.explanationEngine = new MessageExplanationEngine();
        this.moodTracker = new MoodTrackingService();
    }
    async analyzeTone(text) {
        return this.emotionEngine.analyzeEmotion(text);
    }
    async getExplainer(text, isFromCurrentUser = false) {
        const emotionAnalysis = await this.analyzeTone(text);
        return this.explanationEngine.generateExplanation(text, emotionAnalysis);
    }
    contextuallyExplainMessage(text, isFromCurrentUser = false) {
        // ...existing code from llmService.js...
    }
    getStatus() {
        // ...existing code from llmService.js...
    }
    async getDetailedAnalysis(text) {
        // ...existing code from llmService.js...
    }
    // Mood tracking API
    updateConversationScore(conversationId, senderId, emotion, confidence) {
        return this.moodTracker.updateConversationScore(conversationId, senderId, emotion, confidence);
    }
    getConversationScore(conversationId) {
        return this.moodTracker.getConversationScore(conversationId);
    }
    getTrackerPosition(score, perspective = 'user') {
        return this.moodTracker.getTrackerPosition(score, perspective);
    }
    resetConversation(conversationId) {
        return this.moodTracker.resetConversation(conversationId);
    }
    getStatistics(conversationId) {
        return this.moodTracker.getStatistics(conversationId);
    }
    // Local LLM helpers
    normalizeSentiment(response) {
        return normalizeSentiment(response);
    }
    getFallbackResponse(message, queryType) {
        return getFallbackResponse(message, queryType);
    }
}

// Export singleton instance
const llmUnifiedService = new LLMUnifiedService();
export default llmUnifiedService;
