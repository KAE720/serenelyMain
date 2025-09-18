import AsyncStorage from '@react-native-async-storage/async-storage';


let model;
let isInitializing = false;
let initializationPromise = null;

// Performance and usage tracking
const PERFORMANCE_KEY = 'phi2_performance';
const USAGE_KEY = 'phi2_usage';
const MAX_FREE_QUERIES = 50; // Free tier limit



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


// Get color for sentiment-based bubble coloring
export function getSentimentColor(sentiment) {
    const colors = {
        positive: '#28A745',  // 🟢 Rich green - clear positive emotion
        negative: '#DC3545',  // 🔴 Rich red - clear negative emotion
        neutral: '#007BFF'    // 🔵 Rich blue - clear neutral tone
    };
    return colors[sentiment] || colors.neutral;
}






