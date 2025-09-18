// Demo LLM Service - For testing UI without actual model
// This simulates the Phi-2 responses for development and testing

class DemoLLMService {
    constructor() {
        this.initialized = true;
        this.status = 'ready';
        this.model = 'demo-phi2';
    }

    async initialize() {
        console.log('🎯 Demo LLM Service initialized (simulated)');
        return true;
    }

    getStatus() {
        return {
            initialized: true,
            status: 'ready',
            model: 'demo-phi2'
        };
    }

    // Simulated tone analysis
    async analyzeTone(text) {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const lowerText = text.toLowerCase();
        let sentiment = 'neutral';
        let confidence = 0.7;

        // Simple keyword-based analysis for demo
        if (lowerText.includes('love') || lowerText.includes('happy') || lowerText.includes('great') ||
            lowerText.includes('awesome') || lowerText.includes('excited') || lowerText.includes('💕') ||
            lowerText.includes('😊') || lowerText.includes('😄') || lowerText.includes('amazing')) {
            sentiment = 'positive';
            confidence = 0.85;
        } else if (lowerText.includes('hate') || lowerText.includes('angry') || lowerText.includes('terrible') ||
            lowerText.includes('awful') || lowerText.includes('stressed') || lowerText.includes('mad') ||
            lowerText.includes('😡') || lowerText.includes('😢') || lowerText.includes('frustrated')) {
            sentiment = 'negative';
            confidence = 0.82;
        }

        // Map to colors
        const colorMap = {
            'positive': 'green',
            'negative': 'red',
            'neutral': 'blue'
        };

        return {
            color: colorMap[sentiment],
            confidence: confidence,
            isLLMEnhanced: true,
            rawSentiment: sentiment
        };
    }

    // Simulated message explanation
    async getExplainer(text, isCurrentUser = false) {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 600));

        const prefix = isCurrentUser ? "You expressed: " : "They shared: ";

        // Generate contextual explanations
        const lowerText = text.toLowerCase();

        if (lowerText.includes('love')) {
            return `${prefix}Deep affection and positive emotions toward someone special.`;
        } else if (lowerText.includes('stressed') || lowerText.includes('anxious')) {
            return `${prefix}Feelings of pressure and concern about current situations.`;
        } else if (lowerText.includes('happy') || lowerText.includes('excited')) {
            return `${prefix}Joy and enthusiasm about something positive.`;
        } else if (lowerText.includes('angry') || lowerText.includes('mad')) {
            return `${prefix}Frustration and displeasure with a situation or behavior.`;
        } else if (text.includes('?')) {
            return `${prefix}A question seeking information or clarification.`;
        } else if (text.length > 50) {
            return `${prefix}A detailed message sharing thoughts and feelings.`;
        } else {
            return `${prefix}A brief communication conveying their current thoughts.`;
        }
    }

    // Simulated CBT response
    async getCBTHelp(userMessage) {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1200));

        const lowerMsg = userMessage.toLowerCase();
        let response = "";
        let technique = "";

        if (lowerMsg.includes('anxious') || lowerMsg.includes('anxiety')) {
            response = "I understand anxiety can feel overwhelming. Let's try to ground yourself in the present moment. Remember, anxious thoughts are often about future scenarios that may not happen.";
            technique = "Try the 5-4-3-2-1 technique: Name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste.";
        } else if (lowerMsg.includes('sad') || lowerMsg.includes('depressed') || lowerMsg.includes('down')) {
            response = "I hear that you're feeling down. These feelings are valid and temporary. You're stronger than you know, and this difficult moment will pass.";
            technique = "Practice self-compassion: Speak to yourself as you would a good friend going through the same situation.";
        } else if (lowerMsg.includes('angry') || lowerMsg.includes('frustrated') || lowerMsg.includes('mad')) {
            response = "Anger often signals that something important to us feels threatened or violated. Let's explore what's underneath this feeling and find healthy ways to address it.";
            technique = "Try the STOP technique: Stop what you're doing, Take a breath, Observe your feelings, Proceed mindfully.";
        } else if (lowerMsg.includes('stress') || lowerMsg.includes('overwhelmed')) {
            response = "Feeling overwhelmed is a sign that you're dealing with a lot. Let's break things down into smaller, manageable pieces.";
            technique = "Make a list of your concerns and identify just one small action you can take today.";
        } else if (lowerMsg.includes('relationship') || lowerMsg.includes('partner') || lowerMsg.includes('friend')) {
            response = "Relationships can be complex. It's important to communicate openly and honestly while also setting healthy boundaries.";
            technique = "Use 'I' statements when discussing concerns: 'I feel...' instead of 'You always...'";
        } else {
            response = "Thank you for sharing with me. Sometimes just talking through our thoughts and feelings can provide clarity. What feels most important for you to focus on right now?";
            technique = "Take three deep breaths and ask yourself: 'What do I need most in this moment?'";
        }

        return {
            response,
            technique,
            isEnhanced: true,
            timestamp: new Date().toISOString()
        };
    }

    // Simulated summary
    async getSummary(text) {
        await new Promise(resolve => setTimeout(resolve, 500));

        if (text.length > 100) {
            return `Summary: ${text.substring(0, 80)}... (expressing ${this.getEmotionalTone(text)} sentiment)`;
        } else {
            return `Summary: ${text} (${this.getEmotionalTone(text)} tone)`;
        }
    }

    getEmotionalTone(text) {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('love') || lowerText.includes('happy') || lowerText.includes('great')) {
            return 'positive';
        } else if (lowerText.includes('sad') || lowerText.includes('angry') || lowerText.includes('stress')) {
            return 'concerned';
        } else {
            return 'neutral';
        }
    }

    async getStats() {
        return {
            performance: {
                lastLoadTime: 0,
                modelLoaded: true,
                timestamp: new Date().toISOString()
            },
            usage: {
                date: new Date().toDateString(),
                count: 15,
                queries: []
            },
            modelLoaded: true
        };
    }

    cleanup() {
        console.log('🧹 Demo LLM Service cleaned up');
    }
}

// Export singleton instance
const demoLLMService = new DemoLLMService();
export default demoLLMService;
