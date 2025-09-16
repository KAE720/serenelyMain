// moodTrackingService.js - Psychologically-based mood tracking system
// Based on Gottman's 5:1 positive-to-negative ratio principle

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

    /**
     * Calculate points for a message based on psychological principles
     * @param {string} emotion - angry, stressed, neutral, excited
     * @param {number} confidence - confidence level 0-1
     * @returns {number} - points to add/subtract (-20 to +10)
     */
    calculateMessagePoints(emotion, confidence = 0.8) {
        const pointSystem = {
            // POSITIVE EMOTIONS - Encourage connection and affection
            'excited': {
                base: 8,    // High positive impact
                range: [5, 10] // +5 to +10 points
            },

            // NEUTRAL - Stable, respectful communication
            'neutral': {
                base: 1,    // Slight positive for respectful communication
                range: [0, 2] // 0 to +2 points
            },

            // NEGATIVE EMOTIONS - Discourage but not devastate
            'stressed': {
                base: -3,   // Minor negative impact
                range: [-2, -5] // -2 to -5 points (opportunity for support)
            },

            'angry': {
                base: -15,  // Significant negative impact
                range: [-10, -20] // -10 to -20 points (most damaging)
            }
        };

        const emotionData = pointSystem[emotion] || pointSystem['neutral'];
        const [min, max] = emotionData.range;

        // Scale points based on confidence
        const scaledPoints = emotionData.base * confidence;

        // Ensure within range
        return Math.max(min, Math.min(max, Math.round(scaledPoints)));
    }

    /**
     * Update conversation score based on new message
     * @param {string} conversationId - unique conversation identifier
     * @param {string} senderId - who sent the message
     * @param {string} emotion - message emotion
     * @param {number} confidence - confidence level
     * @returns {Object} - updated score data
     */
    updateConversationScore(conversationId, senderId, emotion, confidence) {
        if (!this.conversationScores.has(conversationId)) {
            this.conversationScores.set(conversationId, {
                currentScore: this.baseScore,
                messageHistory: [],
                participants: new Set(),
                lastUpdated: Date.now(),
                dailyScores: [], // For trend analysis
                emotionCounts: {
                    excited: 0,
                    neutral: 0,
                    stressed: 0,
                    angry: 0
                }
            });
        }

        const scoreData = this.conversationScores.get(conversationId);
        scoreData.participants.add(senderId);

        // Calculate points for this message
        const points = this.calculateMessagePoints(emotion, confidence);

        // Update score (keep within 0-100 range)
        const newScore = Math.max(0, Math.min(100, scoreData.currentScore + points));

        // Record the change
        const messageEntry = {
            timestamp: Date.now(),
            senderId: senderId,
            emotion: emotion,
            confidence: confidence,
            pointsAdded: points,
            scoreBefore: scoreData.currentScore,
            scoreAfter: newScore
        };

        scoreData.currentScore = newScore;
        scoreData.messageHistory.push(messageEntry);
        scoreData.emotionCounts[emotion]++;
        scoreData.lastUpdated = Date.now();

        // Keep only last 100 messages for performance
        if (scoreData.messageHistory.length > 100) {
            scoreData.messageHistory = scoreData.messageHistory.slice(-100);
        }

        this.conversationScores.set(conversationId, scoreData);

        return {
            currentScore: newScore,
            pointsAdded: points,
            emotion: emotion,
            healthStatus: this.getHealthStatus(newScore),
            recommendation: this.getRecommendation(newScore, emotion, points)
        };
    }

    /**
     * Get health status based on current score
     * @param {number} score - current conversation score (0-100)
     * @returns {Object} - health status with color and description
     */
    getHealthStatus(score) {
        if (score >= 80) {
            return {
                status: 'excellent',
                color: '#4CAF50', // Green
                description: 'Excellent communication! 🌟'
            };
        } else if (score >= 65) {
            return {
                status: 'good',
                color: '#8BC34A', // Light green
                description: 'Good relationship health 😊'
            };
        } else if (score >= 50) {
            return {
                status: 'neutral',
                color: '#FFC107', // Amber
                description: 'Balanced communication ⚖️'
            };
        } else if (score >= 35) {
            return {
                status: 'concerning',
                color: '#FF9800', // Orange
                description: 'Some tension detected ⚠️'
            };
        } else {
            return {
                status: 'poor',
                color: '#F44336', // Red
                description: 'Communication needs attention 💔'
            };
        }
    }

    /**
     * Get recommendation based on current state
     * @param {number} score - current score
     * @param {string} emotion - last message emotion
     * @param {number} points - points from last message
     * @returns {string} - recommendation text
     */
    getRecommendation(score, emotion, points) {
        if (emotion === 'angry' && points < -10) {
            return "Consider rephrasing to avoid conflict. Try expressing your feelings without blame.";
        } else if (emotion === 'stressed' && score < 60) {
            return "Your partner might need support. Consider offering help or understanding.";
        } else if (emotion === 'excited' && score < 70) {
            return "Great positive energy! Keep sharing good vibes to boost your connection.";
        } else if (score < 40) {
            return "Focus on positive, supportive messages to improve your relationship health.";
        } else if (score > 80) {
            return "Fantastic communication! You're building a strong, healthy relationship.";
        } else {
            return "Keep communicating openly and positively.";
        }
    }

    /**
     * Get conversation score data
     * @param {string} conversationId - conversation identifier
     * @returns {Object|null} - score data or null if not found
     */
    getConversationScore(conversationId) {
        return this.conversationScores.get(conversationId) || null;
    }

    /**
     * Get tracker position for UI (0-1 scale where 0.5 is center)
     * @param {number} score - current score (0-100)
     * @param {string} perspective - 'user' or 'partner'
     * @returns {number} - position from 0 (worst) to 1 (best)
     */
    getTrackerPosition(score, perspective = 'user') {
        // Convert 0-100 score to 0-1 position
        // 50 (neutral) = 0.5 (center)
        // 100 (best) = 1.0 (far end)
        // 0 (worst) = 0.0 (near end)

        const position = score / 100;

        // For partner perspective, we might want to invert this
        // so their worst is on their side (left) and best is center/right
        if (perspective === 'partner') {
            return position; // 0 = leftmost (worst for them), 1 = rightmost (best)
        } else {
            return position; // 0 = leftmost, 1 = rightmost (worst for user)
        }
    }

    /**
     * Reset conversation score
     * @param {string} conversationId - conversation to reset
     */
    resetConversation(conversationId) {
        if (this.conversationScores.has(conversationId)) {
            const scoreData = this.conversationScores.get(conversationId);
            scoreData.currentScore = this.baseScore;
            scoreData.messageHistory = [];
            scoreData.emotionCounts = { excited: 0, neutral: 0, stressed: 0, angry: 0 };
            this.conversationScores.set(conversationId, scoreData);
        }
    }

    /**
     * Get statistics for analysis
     * @param {string} conversationId - conversation identifier
     * @returns {Object} - statistics object
     */
    getStatistics(conversationId) {
        const scoreData = this.conversationScores.get(conversationId);
        if (!scoreData) return null;

        const totalMessages = scoreData.messageHistory.length;
        const positiveMessages = scoreData.emotionCounts.excited;
        const negativeMessages = scoreData.emotionCounts.angry + scoreData.emotionCounts.stressed;
        const ratio = negativeMessages > 0 ? positiveMessages / negativeMessages : positiveMessages;

        return {
            totalMessages,
            positiveMessages,
            negativeMessages,
            positiveToNegativeRatio: ratio,
            gottmanHealthy: ratio >= 5, // Gottman's 5:1 ratio
            currentScore: scoreData.currentScore,
            emotionBreakdown: { ...scoreData.emotionCounts }
        };
    }
}

// Create and export singleton instance
const moodTrackingService = new MoodTrackingService();
export default moodTrackingService;
