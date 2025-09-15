// services/toneAnalysisService.js
// Mock tone analysis service - replace with real cloud API later

const MOCK_TONE_RESPONSES = [
    { tone: 'positive', confidence: 0.89, explanation: 'This message expresses joy, satisfaction, or optimism' },
    { tone: 'supportive', confidence: 0.85, explanation: 'This message shows care, understanding, and emotional support' },
    { tone: 'neutral', confidence: 0.78, explanation: 'This message has a balanced, matter-of-fact tone' },
    { tone: 'excited', confidence: 0.92, explanation: 'This message shows enthusiasm and high energy' },
    { tone: 'stressed', confidence: 0.81, explanation: 'This message indicates anxiety, worry, or pressure' },
    { tone: 'sad', confidence: 0.87, explanation: 'This message expresses sadness, disappointment, or melancholy' },
    { tone: 'angry', confidence: 0.83, explanation: 'This message may come across as frustrated, irritated, or upset' },
    { tone: 'concerned', confidence: 0.79, explanation: 'This message shows worry or care about a situation' },
];

/**
 * Analyzes the emotional tone of a text message
 * In production, this would call OpenAI, Claude, or another cloud API
 */
export const analyzeTone = async (text) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // Simple keyword-based mock analysis
    const lowerText = text.toLowerCase();

    // Check for specific keywords to give more realistic results
    if (lowerText.includes('love') || lowerText.includes('happy') || lowerText.includes('great') || lowerText.includes('wonderful')) {
        return { tone: 'positive', confidence: 0.85 + Math.random() * 0.15, explanation: 'This message expresses joy, satisfaction, or optimism' };
    }

    if (lowerText.includes('sorry') || lowerText.includes('understand') || lowerText.includes('here for you')) {
        return { tone: 'supportive', confidence: 0.80 + Math.random() * 0.20, explanation: 'This message shows care, understanding, and emotional support' };
    }

    if (lowerText.includes('stress') || lowerText.includes('overwhelm') || lowerText.includes('tired') || lowerText.includes('work')) {
        return { tone: 'stressed', confidence: 0.75 + Math.random() * 0.20, explanation: 'This message indicates anxiety, worry, or pressure' };
    }

    if (lowerText.includes('sad') || lowerText.includes('down') || lowerText.includes('disappointed')) {
        return { tone: 'sad', confidence: 0.80 + Math.random() * 0.15, explanation: 'This message expresses sadness, disappointment, or melancholy' };
    }

    if (lowerText.includes('angry') || lowerText.includes('frustrated') || lowerText.includes('annoyed') || lowerText.includes('!')) {
        return { tone: 'angry', confidence: 0.75 + Math.random() * 0.20, explanation: 'This message may come across as frustrated, irritated, or upset' };
    }

    if (lowerText.includes('excited') || lowerText.includes('amazing') || lowerText.includes('awesome') || lowerText.includes('!!!')) {
        return { tone: 'excited', confidence: 0.85 + Math.random() * 0.15, explanation: 'This message shows enthusiasm and high energy' };
    }

    if (lowerText.includes('worried') || lowerText.includes('concern') || lowerText.includes('hope')) {
        return { tone: 'concerned', confidence: 0.75 + Math.random() * 0.20, explanation: 'This message shows worry or care about a situation' };
    }

    // Default to a random response for other messages
    const randomResponse = MOCK_TONE_RESPONSES[Math.floor(Math.random() * MOCK_TONE_RESPONSES.length)];
    return {
        ...randomResponse,
        confidence: randomResponse.confidence + (Math.random() * 0.2 - 0.1) // Add some variance
    };
};

/**
 * Get tone-appropriate response suggestions
 */
export const getToneSuggestions = async (incomingTone, incomingMessage) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const suggestions = {
        positive: [
            "That's wonderful to hear! 😊",
            "I'm so glad you're feeling good about this",
            "Your positivity is infectious!"
        ],
        supportive: [
            "Thank you for being so understanding",
            "I really appreciate your support",
            "It means a lot that you care"
        ],
        stressed: [
            "I hear that you're feeling overwhelmed. Is there anything I can do to help?",
            "That sounds really challenging. Want to talk about it?",
            "Take a deep breath. We can work through this together."
        ],
        sad: [
            "I'm sorry you're going through this. I'm here for you.",
            "Sending you a big hug 🤗",
            "It's okay to feel sad. Do you want to share more about what's bothering you?"
        ],
        angry: [
            "I can see this is really important to you. Help me understand your perspective.",
            "I hear your frustration. Let's take a step back and talk about this calmly.",
            "I want to understand how you're feeling. Can we discuss this?"
        ],
        excited: [
            "Your excitement is contagious! Tell me more!",
            "That's amazing! I'm so happy for you!",
            "Wow, that sounds incredible!"
        ],
        concerned: [
            "I appreciate you sharing your concerns with me",
            "Thank you for caring. Let's figure this out together.",
            "Your thoughtfulness means a lot to me"
        ],
        neutral: [
            "I understand what you're saying",
            "Thanks for letting me know",
            "I hear you"
        ]
    };

    const toneSuggestions = suggestions[incomingTone] || suggestions.neutral;
    return toneSuggestions.slice(0, 3); // Return top 3 suggestions
};

/**
 * Mock conversation insights
 */
export const getConversationInsights = async (messages) => {
    // Simulate API processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const tones = messages.map(m => m.tone);
    const totalMessages = messages.length;

    // Count tone frequencies
    const toneCount = {};
    tones.forEach(tone => {
        toneCount[tone] = (toneCount[tone] || 0) + 1;
    });

    const dominantTone = Object.keys(toneCount).reduce((a, b) =>
        toneCount[a] > toneCount[b] ? a : b
    );

    const positiveCount = (toneCount.positive || 0) + (toneCount.excited || 0) + (toneCount.supportive || 0);
    const negativeCount = (toneCount.angry || 0) + (toneCount.sad || 0) + (toneCount.stressed || 0);

    const positivityScore = totalMessages > 0 ? (positiveCount / totalMessages) * 100 : 0;

    return {
        dominantTone,
        positivityScore: Math.round(positivityScore),
        totalMessages,
        toneBreakdown: toneCount,
        insights: [
            `This conversation has a ${positivityScore > 60 ? 'predominantly positive' : positivityScore > 40 ? 'balanced' : 'challenging'} emotional tone`,
            `The most common tone is ${dominantTone}`,
            totalMessages < 5 ? 'Continue the conversation to get more detailed insights' : 'Good communication flow detected'
        ]
    };
};
