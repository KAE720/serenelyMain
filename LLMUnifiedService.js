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
    detectNegation(text) {
        const negationWords = ["not", "no", "never", "none", "nobody", "nothing", "neither", "nor"];
        const lowerText = text.toLowerCase();
        return negationWords.some(word => lowerText.includes(word));
    }
    scoreKeywords(words, keywords) {
        let score = 0;
        words.forEach(word => {
            if (keywords.includes(word)) {
                score += 1;
            }
        });
        return score;
    }
    scorePhrases(text, phrases) {
        let score = 0;
        phrases.forEach(phrase => {
            if (text.includes(phrase)) {
                score += 1;
            }
        });
        return score;
    }
    scoreContextualClues(text, clues) {
        let score = 0;
        clues.forEach(clue => {
            if (text.includes(clue)) {
                score += 1;
            }
        });
        return score;
    }
    scoreEmoticons(text, emoticons) {
        let score = 0;
        emoticons.forEach(emoticon => {
            if (text.includes(emoticon)) {
                score += 1;
            }
        });
        return score;
    }
    detectIntensifiers(text, intensifiers) {
        const foundIntensifiers = [];
        intensifiers.forEach(intensifier => {
            if (text.includes(intensifier)) {
                foundIntensifiers.push(intensifier);
            }
        });
        return foundIntensifiers;
    }
    calculateNeutralScore(text) {
        const neutralWords = ["okay", "fine", "alright", "sure", "maybe", "perhaps", "possibly"];
        let score = 0;
        neutralWords.forEach(word => {
            if (text.includes(word)) {
                score += 1;
            }
        });
        return score;
    }
    calculateConfidence(scores, dominantEmotion) {
        const total = Object.values(scores).reduce((a, b) => a + b, 0);
        if (total === 0) return 0;
        const dominantScore = scores[dominantEmotion] || 0;
        return dominantScore / total;
    }
}

// --- Message Explanation Engine ---
class MessageExplanationEngine {
    constructor() { }
    generateExplanation(text, emotionAnalysis) {
        const { emotion, confidence } = emotionAnalysis;
        let explanation = `The emotion detected is ${emotion} with a confidence of ${confidence * 100}%.`;
        switch (emotion) {
            case 'angry':
                explanation += ' This message may indicate anger or frustration.';
                break;
            case 'stressed':
                explanation += ' This message may indicate stress or anxiety.';
                break;
            case 'excited':
                explanation += ' This message conveys excitement or happiness.';
                break;
            case 'neutral':
                explanation += ' This message appears to be neutral.';
                break;
            default:
                explanation += ' The emotion detected is not clear.';
        }
        return explanation;
    }
    analyzeMessageContent(text, emotionAnalysis) {
        const { emotion } = emotionAnalysis;
        // Further analysis can be done here based on the message content and detected emotion
    }
}

// --- Mood Tracking Service ---
class MoodTrackingService {
    constructor() {
        this.initialized = false;
        this.conversationScores = new Map(); // conversationId -> score data
        this.baseScore = 50; // Neutral starting point (out of 100)
        this.init();
    }
    init() {
        this.initialized = true;
    }
    calculateMessagePoints(emotion, confidence = 0.8) {
        const pointSystem = {
            'excited': {
                base: 8, range: [5, 10]
            },
            'neutral': {
                base: 1, range: [0, 2]
            },
            'stressed': {
                base: -3, range: [-2, -5]
            },
            'angry': {
                base: -15, range: [-10, -20]
            }
        };
        const emotionData = pointSystem[emotion] || pointSystem['neutral'];
        const [min, max] = emotionData.range;
        // Scale points based on confidence
        const scaledPoints = emotionData.base * confidence;
        // ...existing code...
    }
    updateConversationScore(conversationId, senderId, emotion, confidence) {
        if (!this.initialized) return;
        const points = this.calculateMessagePoints(emotion, confidence);
        const currentScore = this.conversationScores.get(conversationId) || this.baseScore;
        const newScore = Math.min(Math.max(currentScore + points, 0), 100);
        this.conversationScores.set(conversationId, newScore);
        // Optionally, store the score in AsyncStorage or another persistent storage
    }
    getHealthStatus(score) {
        if (score >= 70) {
            return 'healthy';
        } else if (score >= 40) {
            return 'neutral';
        } else {
            return 'unhealthy';
        }
    }
    getRecommendation(score, emotion, points) {
        // Simple recommendation logic based on score and detected emotion
        if (emotion === 'stressed' || emotion === 'angry') {
            return 'Consider taking a break or talking to someone about your feelings.';
        } else if (emotion === 'excited') {
            return 'Keep up the positive energy!';
        }
        return 'Maintain your current course of action.';
    }
    getConversationScore(conversationId) {
        return this.conversationScores.get(conversationId) || this.baseScore;
    }
    getTrackerPosition(score, perspective = 'user') {
        // ...existing code...
    }
    resetConversation(conversationId) {
        this.conversationScores.delete(conversationId);
    }
    getStatistics(conversationId) {
        // ...existing code...
    }
}

// --- Local LLM Service helpers ---
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

function getFallbackResponse(message, queryType) {
    switch (queryType) {
        case 'sentiment':
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
