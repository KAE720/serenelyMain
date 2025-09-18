// Enhanced LLM Service - Integrates Phi-2 with existing ChatScreen
import * as localLLMService from './localLLMService';

class EnhancedLLMService {
    constructor() {
        this.initialized = false;
        this.status = 'idle'; // idle, loading, ready, error
        this.model = 'phi-2';
    }

    async initialize() {
        if (this.initialized) return true;

        this.status = 'loading';
        console.log('🚀 Initializing Enhanced LLM Service...');

        try {
            const success = await localLLMService.initLocalLLM();
            if (success) {
                this.initialized = true;
                this.status = 'ready';
                console.log('✅ Enhanced LLM Service ready with Phi-2');
                return true;
            } else {
                this.status = 'fallback';
                console.log('⚠️ Enhanced LLM Service using fallback mode (Phi-2 unavailable)');
                // Still return true because we have fallback demo service
                return true;
            }
        } catch (error) {
            this.status = 'fallback';
            console.error('❌ Enhanced LLM Service initialization failed:', error);
            console.log('🎯 Using demo service fallback');
            return true; // Always succeed because we have demo service
        }
    }

    getStatus() {
        return {
            initialized: this.initialized,
            status: this.status,
            model: this.model
        };
    }

    // Main tone analysis function - integrates with existing ChatScreen
    async analyzeTone(text) {
        try {
            const sentiment = await localLLMService.queryLocalLLM(text, 'sentiment');
            const confidence = this.calculateConfidence(text, sentiment);

            // Map to your existing color system
            const colorMap = {
                'positive': 'green',
                'negative': 'red',
                'neutral': 'blue'
            };

            return {
                color: colorMap[sentiment] || 'blue',
                confidence: confidence,
                isLLMEnhanced: this.initialized,
                rawSentiment: sentiment
            };
        } catch (error) {
            console.error('Tone analysis error:', error);
            return {
                color: 'blue',
                confidence: 0.5,
                isLLMEnhanced: false,
                rawSentiment: 'neutral'
            };
        }
    }

    // Message explanation function - integrates with existing ChatScreen
    async getExplainer(text, isCurrentUser = false) {
        try {
            const explanation = await localLLMService.queryLocalLLM(text, 'explanation');

            // Add context based on sender
            const prefix = isCurrentUser ? "You expressed: " : "They shared: ";
            return `${prefix}${explanation}`;

        } catch (error) {
            console.error('Explanation error:', error);
            return isCurrentUser ? "Your message conveys your thoughts" : "Their message shares their perspective";
        }
    }

    // CBT Therapist mode
    async getCBTHelp(userMessage) {
        try {
            const cbtData = await localLLMService.getCBTResponse(userMessage);
            return {
                response: cbtData.response,
                technique: cbtData.technique,
                isEnhanced: this.initialized,
                timestamp: cbtData.timestamp
            };
        } catch (error) {
            console.error('CBT error:', error);
            return {
                response: "I understand you're going through something difficult. Take a moment to breathe and remember that you're not alone.",
                technique: "Try focusing on your breath for a few moments.",
                isEnhanced: false,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Message summary for AI button popups
    async getSummary(text) {
        try {
            return await localLLMService.queryLocalLLM(text, 'summary');
        } catch (error) {
            console.error('Summary error:', error);
            return `Summary: ${text.length > 50 ? text.substring(0, 50) + '...' : text}`;
        }
    }

    // Helper: Calculate confidence based on text characteristics
    calculateConfidence(text, sentiment) {
        let confidence = 0.7; // Base confidence

        // Adjust based on text length
        if (text.length > 100) confidence += 0.1;
        if (text.length < 10) confidence -= 0.2;

        // Adjust based on emotional keywords
        const strongPositive = ['love', 'amazing', 'perfect', 'wonderful', 'fantastic'];
        const strongNegative = ['hate', 'terrible', 'awful', 'horrible', 'disaster'];

        const lowerText = text.toLowerCase();
        const hasStrongPositive = strongPositive.some(word => lowerText.includes(word));
        const hasStrongNegative = strongNegative.some(word => lowerText.includes(word));

        if (hasStrongPositive && sentiment === 'positive') confidence += 0.2;
        if (hasStrongNegative && sentiment === 'negative') confidence += 0.2;

        // Adjust for punctuation intensity
        const exclamationCount = (text.match(/!/g) || []).length;
        if (exclamationCount > 0) confidence += Math.min(0.1, exclamationCount * 0.05);

        return Math.min(0.95, Math.max(0.3, confidence));
    }

    // Get AI statistics for debugging/user info
    async getStats() {
        return await localLLMService.getAIStats();
    }

    // Cleanup resources
    cleanup() {
        localLLMService.cleanup();
        this.initialized = false;
        this.status = 'idle';
    }
}

// Export singleton instance
const enhancedLLMService = new EnhancedLLMService();
export default enhancedLLMService;
