// ChatScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import enhancedToneAnalysisService from "./services/enhancedToneAnalysisService";
import llmService from "./llmService";
import moodTrackingService from "./moodTrackingService";

export default function ChatScreen({ chatPartner, currentUser, onBack }) {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [aiExplanation, setAiExplanation] = useState(null); // For AI popup
    const [isLLMReady, setIsLLMReady] = useState(false); // Track LLM status
    const [moodScore, setMoodScore] = useState(50); // Mood tracking score (0-100)
    const [moodHealth, setMoodHealth] = useState(null); // Health status object
    const flatListRef = useRef(null);

    // Initialize enhanced tone analysis and mock messages
    useEffect(() => {
        // Initialize the enhanced tone analysis service
        const initializeEnhancedAnalysis = async () => {
            try {
                // COPILOT INTEGRATION: Initialize the new LLM service
                await llmService.initialize();
                const llmStatus = llmService.getStatus();
                
                // Fallback to enhanced tone analysis service
                const isReady = await enhancedToneAnalysisService.initializeLLM();
                setIsLLMReady(llmStatus.initialized || isReady);
                console.log('AI Analysis initialized:', llmStatus.initialized ? 'LLM ready' : 'Using fallback');
            } catch (error) {
                console.error('Failed to initialize AI analysis:', error);
                setIsLLMReady(false);
            }
        };

        initializeEnhancedAnalysis();

        // Simulate loading messages from backend
        setTimeout(() => {
            const userId = currentUser?.uid || currentUser?.id || "current_user";
            const mockMessages = [
                {
                    id: "1",
                    text: "Hey, how are you doing today?",
                    sender: chatPartner.id,
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    tone: "excited",
                    toneConfidence: 0.85,
                    explanation: "Checking on your wellbeing",
                    isEnhanced: false,
                },
                {
                    id: "2",
                    text: "I'm feeling a bit stressed about work lately.",
                    sender: userId,
                    timestamp: new Date(Date.now() - 3000000).toISOString(),
                    tone: "stressed",
                    toneConfidence: 0.78,
                    explanation: "Sharing work stress",
                    isEnhanced: true,
                },
                {
                    id: "3",
                    text: "I'm sorry to hear that. Want to talk about it?",
                    sender: chatPartner.id,
                    timestamp: new Date(Date.now() - 2700000).toISOString(),
                    tone: "excited",
                    toneConfidence: 0.92,
                    explanation: "Offering emotional support",
                    isEnhanced: false,
                },
                {
                    id: "4",
                    text: "Yeah, my boss has been really demanding lately and I feel overwhelmed.",
                    sender: userId,
                    timestamp: new Date(Date.now() - 2400000).toISOString(),
                    tone: "stressed",
                    toneConfidence: 0.76,
                    explanation: "Complaining about supervisor",
                    isEnhanced: true,
                },
                {
                    id: "5",
                    text: "That sounds really tough. Have you thought about talking to HR?",
                    sender: chatPartner.id,
                    timestamp: new Date(Date.now() - 2100000).toISOString(),
                    tone: "neutral",
                    toneConfidence: 0.65,
                    explanation: "Suggesting HR involvement",
                    isEnhanced: false,
                },
                {
                    id: "6",
                    text: "I love that you're always so supportive! 💕",
                    sender: userId,
                    timestamp: new Date(Date.now() - 1800000).toISOString(),
                    tone: "excited",
                    toneConfidence: 0.91,
                    explanation: "Appreciating your support",
                    isEnhanced: true,
                },
            ];
            
            setMessages(mockMessages);
            
            // Initialize mood tracking with existing messages
            const conversationId = `${userId}_${chatPartner.id}`;
            let currentScore = 50; // Start at neutral
            
            mockMessages.forEach(message => {
                const moodUpdate = moodTrackingService.updateConversationScore(
                    conversationId,
                    message.sender,
                    message.tone,
                    message.toneConfidence
                );
                currentScore = moodUpdate.currentScore;
            });
            
            // Set final mood state
            setMoodScore(currentScore);
            const finalHealth = moodTrackingService.getConversationScore(conversationId);
            if (finalHealth) {
                setMoodHealth(moodTrackingService.getHealthStatus(currentScore));
            }
        }, 500);
    }, []);

    const analyzeToneForMessage = async (text) => {
        try {
            // COPILOT INTEGRATION: Use the new analyzeTone function
            const copilotAnalysis = await llmService.analyzeTone(text);
            
            // Map Copilot colors back to existing emotion names for UI compatibility
            const colorToEmotionMap = {
                'red': 'angry',
                'orange': 'stressed', 
                'blue': 'neutral',
                'green': 'excited'
            };
            
            const mappedTone = colorToEmotionMap[copilotAnalysis.color] || 'neutral';
            
            // Get proper message explanation (what the message is saying)
            const messageExplanation = await llmService.getExplainer(text, true); // true = message is from current user
            
            return {
                tone: mappedTone,
                confidence: copilotAnalysis.confidence,
                explanation: messageExplanation, // Now uses proper message meaning explanation
                method: copilotAnalysis.isLLMEnhanced ? 'llm' : 'demo',
                isEnhanced: copilotAnalysis.isLLMEnhanced
            };
        } catch (error) {
            console.error("Enhanced tone analysis failed:", error);
            // Fallback to existing logic with improved explanations
            const analysis = await enhancedToneAnalysisService.analyzeTone(text);
            
            // Map to 4 core emotions for dual tracker design
            const coreEmotions = ['angry', 'stressed', 'neutral', 'excited'];
            let mappedTone = analysis.tone;

            // Ensure we only use core emotions
            if (!coreEmotions.includes(analysis.tone)) {
                // Map common variations to our 4 core emotions
                if (['positive', 'supportive', 'cheerful', 'content', 'calm', 'joyful', 'loving', 'happy'].includes(analysis.tone)) {
                    mappedTone = 'excited'; // All positive emotions -> excited (purple)
                } else if (['negative', 'frustrated', 'irritated', 'furious'].includes(analysis.tone)) {
                    mappedTone = 'angry';
                } else if (['anxious', 'worried', 'overwhelmed', 'tense', 'sad', 'down', 'melancholy', 'disappointed'].includes(analysis.tone)) {
                    mappedTone = 'stressed'; // Map anxiety and sadness to stressed (orange)
                } else {
                    mappedTone = 'neutral';
                }
            }

            // Generate a simple message explanation for fallback
            const fallbackExplanation = generateFallbackExplanation(text);

            return {
                ...analysis,
                tone: mappedTone,
                explanation: fallbackExplanation,
                isEnhanced: analysis.method === 'llm' // Track if LLM was used
            };
        }
    };

    // Fallback explanation generator - concise message meaning
    const generateFallbackExplanation = (text) => {
        const lowerText = text.toLowerCase();
        
        // Ultra-concise explanations of what was actually said
        if (lowerText.includes('why did you') && lowerText.includes('without me')) {
            return 'Questioning exclusion';
        }
        if (lowerText.includes('happy now') && lowerText.includes('wanna')) {
            return 'Mood improved, suggesting activity';
        }
        if (lowerText.includes('watch') && (lowerText.includes('football') || lowerText.includes('game'))) {
            return 'Inviting to watch sports';
        }
        if (lowerText.includes('i love you')) {
            return 'Declaring love';
        }
        if (lowerText.includes('thank you') || lowerText.includes('thanks')) {
            return 'Expressing gratitude';
        }
        if (lowerText.includes('how are you')) {
            return 'Checking wellbeing';
        }
        if (lowerText.includes('stressed about work')) {
            return 'Sharing work stress';
        }
        if (lowerText.includes('not happy with you')) {
            return 'Expressing displeasure';
        }
        if (lowerText.includes('sorry to hear')) {
            return 'Offering sympathy';
        }
        if (text.includes('?')) {
            return 'Asking question';
        }
        if (text.length < 15) {
            return 'Brief message';
        }
        
        return 'Personal communication';
    };

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        setLoading(true);
        const messageText = inputText.trim();
        setInputText("");

        try {
            // Analyze tone
            const toneAnalysis = await analyzeToneForMessage(messageText);

            const newMessage = {
                id: Date.now().toString(),
                text: messageText,
                sender: currentUser?.uid || currentUser?.id || "current_user",
                timestamp: new Date().toISOString(),
                tone: toneAnalysis.tone,
                toneConfidence: toneAnalysis.confidence,
                explanation: toneAnalysis.explanation,
                isEnhanced: toneAnalysis.isEnhanced || false, // Include enhancement status
            };

            setMessages(prev => [...prev, newMessage]);

            // Update mood tracking based on message emotion
            const conversationId = `${currentUser?.uid || currentUser?.id}_${chatPartner.id}`;
            const moodUpdate = moodTrackingService.updateConversationScore(
                conversationId,
                currentUser?.uid || currentUser?.id || "current_user",
                toneAnalysis.tone,
                toneAnalysis.confidence
            );
            
            // Update mood state
            setMoodScore(moodUpdate.currentScore);
            setMoodHealth(moodUpdate.healthStatus);

            // Get suggestions for the partner based on the tone
            if (toneAnalysis.tone !== 'neutral') {
                const toneSuggestions = await enhancedToneAnalysisService.getToneSuggestions(toneAnalysis.tone, messageText);
                setSuggestions(toneSuggestions);
                setShowSuggestions(true);
            }

            // Scroll to bottom
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);

        } catch (error) {
            Alert.alert("Error", "Failed to send message");
            setInputText(messageText); // Restore text on error
        } finally {
            setLoading(false);
        }
    };

    const getToneColor = (tone) => {
        const toneColors = {
            // 4-emotion scale: Natural, Muted Colors
            angry: "#A1232B",      // � Crimson Rust - Deep, muted red with a hint of brown
            stressed: "#D9772B",   // � Burnt Amber - Earthy orange, less neon, more grounded
            neutral: "#4A90A4",    // � Slate Blue - Cool, slightly dusty blue
            excited: "#4CAF50",    // 😄 Verdant Spring - Fresh green with a natural softness

            // Map legacy variations
            happy: "#4CAF50",      // Map to excited (verdant spring)
            sad: "#D9772B",        // Map to stressed (burnt amber) - low-energy negative
            positive: "#4CAF50",   // -> excited (verdant spring)
            negative: "#A1232B",   // -> angry (crimson rust)
            supportive: "#4CAF50", // -> excited (verdant spring)
            worried: "#D9772B",    // -> stressed (burnt amber)
            calm: "#4A90A4",       // -> neutral (slate blue)
        };
        return toneColors[tone] || toneColors.neutral;
    };

    const getToneExplanation = (message) => {
        // Enhanced explanations for the 5 symmetric emotions
        const detailedExplanations = {
            angry: `This message shows frustration, irritation, or strong displeasure. The sender is expressing negative emotions that may need addressing and empathy.`,
            stressed: `This message indicates anxiety, worry, or feeling overwhelmed. The sender may be dealing with pressure and could benefit from support and understanding.`,
            neutral: `This message maintains a balanced, calm tone without strong emotional indicators. It's factual and measured in approach.`,
            happy: `This message conveys contentment, positivity, and warmth. The sender is expressing satisfaction and creating a welcoming atmosphere for conversation.`,
            excited: `This message demonstrates enthusiasm, joy, and high energy. The sender is sharing positive excitement, love, or awe about something special.`,

            // Legacy mappings
            sad: `This message reflects feelings of sorrow or disappointment. The sender may be seeking comfort or expressing vulnerability.`,
        };

        return message.explanation || detailedExplanations[message.tone] || `This message has a ${message.tone} tone with ${Math.round(message.toneConfidence * 100)}% confidence`;
    };

    // Calculate conversation emotion for each person separately - NEW SCORING SYSTEM
    const getPersonEmotion = (personId) => {
        const personMessages = messages.filter(msg => msg.sender === personId);
        if (personMessages.length === 0) return 0.5; // neutral starting point (50/100)

        // Calculate total points based on your specified scoring system
        let totalPoints = 50; // Start at neutral (50/100)
        
        personMessages.forEach(msg => {
            switch(msg.tone) {
                case 'excited':
                case 'happy':
                    // Happy: +5 to +10 points (using +7.5 average)
                    totalPoints += 7.5;
                    break;
                case 'stressed':
                    // Stressed: -2 to -5 points (using -3.5 average)
                    totalPoints -= 3.5;
                    break;
                case 'angry':
                    // Angry: -10 to -20 points (using -15 average)
                    totalPoints -= 15;
                    break;
                case 'neutral':
                    // Calm/Neutral: +1 to +2 points (using +1.5 average)
                    totalPoints += 1.5;
                    break;
                default:
                    // Unknown tone, treat as neutral
                    totalPoints += 1.5;
                    break;
            }
        });

        // Clamp between 0 and 100
        totalPoints = Math.max(0, Math.min(100, totalPoints));
        
        // Convert to 0.0-1.0 scale for positioning
        return totalPoints / 100;
    };

    // Calculate individual person's score (0-100) - now uses the new scoring system
    const getPersonScore = (personId) => {
        const emotion = getPersonEmotion(personId);
        // emotion is already 0.0-1.0 from the new scoring system
        return Math.round(emotion * 100);
    };

    // Calculate relative relationship health based on both people's positions and proximity to center
    const getRelativeRelationshipHealth = () => {
        const partnerScore = getPersonScore(chatPartner.id);
        const userScore = getPersonScore(currentUser?.uid || currentUser?.id || "current_user");
        
        // Calculate how close each person is to the optimal center (50)
        const partnerDistanceFromCenter = Math.abs(50 - partnerScore);
        const userDistanceFromCenter = Math.abs(50 - userScore);
        
        // Convert distance to closeness score (0-50 becomes 50-0)
        const partnerCloseness = 50 - partnerDistanceFromCenter;
        const userCloseness = 50 - userDistanceFromCenter;
        
        // Relationship health is based on how close both are to meeting in the middle
        // When both are at 50 (center), closeness = 50 each, total = 100
        // When one is at 0 and other at 100, average closeness = 25, total = 50
        // When both are at 0 or both at 100, closeness = 0 each, total = 0
        const relationshipHealth = Math.round((partnerCloseness + userCloseness));
        
        // Ensure it's between 0-100
        return Math.max(0, Math.min(100, relationshipHealth));
    };

    // Get dynamic color for each person's tracker dot - magenta for partner, black for user
    const getPersonTrackerColor = (emotion, isPartner = false) => {
        if (isPartner) {
            return '#FF00FF'; // Bright Magenta/Fuchsia for partner
        } else {
            return '#000000'; // Jet Black for user
        }
    };

    // COPILOT HELPER: Color mapping function for message bubbles
    const getMessageBubbleColorFromCopilot = (copilotColor, tone) => {
        // Use existing getToneColor function with mapped tone
        return getToneColor(tone);
    };

    const renderMessage = ({ item }) => {
        const userId = currentUser?.uid || currentUser?.id || "current_user";
        const isOwnMessage = item.sender === userId;
        const toneColor = getToneColor(item.tone);
        const showingExplanation = aiExplanation?.messageId === item.id;

        return (
            <View style={[
                styles.messageContainer,
                isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
            ]}>
                <View style={[
                    styles.messageBubble,
                    isOwnMessage ? styles.ownBubble : styles.otherBubble,
                    {
                        backgroundColor: toneColor,
                        // Enhanced visual distinction
                        opacity: isOwnMessage ? 1.0 : 0.9,
                        borderWidth: isOwnMessage ? 0 : 1.5,
                        borderColor: isOwnMessage ? 'transparent' : 'rgba(255,255,255,0.3)',
                        // Subtle inner shadow effect
                        ...(isOwnMessage ? {
                            shadowColor: toneColor,
                            shadowOffset: { width: 0, height: -1 },
                            shadowOpacity: 0.3,
                            shadowRadius: 2,
                        } : {}),
                    }
                ]}>
                    <Text style={[
                        styles.messageText,
                        // Enhanced text styling
                        {
                            color: '#fff',
                            textShadowColor: 'rgba(0,0,0,0.3)',
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 2,
                        }
                    ]}>
                        {item.text}
                    </Text>

                    {/* AI button and enhancement indicator */}
                    <View style={styles.aiButtonContainer}>
                        {/* LLM Enhancement Indicator */}
                        {item.isEnhanced && (
                            <View style={styles.enhancementIndicator}>
                                <Text style={styles.enhancementText}>✓</Text>
                            </View>
                        )}
                        
                        <TouchableOpacity
                            style={[styles.aiButton, showingExplanation && styles.aiButtonActive]}
                            onPress={async () => {
                                if (showingExplanation) {
                                    setAiExplanation(null);
                                } else {
                                    // Generate fresh AI explanation using LLM
                                    try {
                                        const freshExplanation = await llmService.getExplainer(item.text, isOwnMessage);
                                        setAiExplanation({
                                            messageId: item.id,
                                            tone: item.tone,
                                            explanation: freshExplanation,
                                            color: toneColor,
                                            isEnhanced: item.isEnhanced
                                        });
                                    } catch (error) {
                                        console.error('Failed to get AI explanation:', error);
                                        // Fallback to stored explanation
                                        setAiExplanation({
                                            messageId: item.id,
                                            tone: item.tone,
                                            explanation: item.explanation || getToneExplanation(item),
                                            color: toneColor,
                                            isEnhanced: item.isEnhanced
                                        });
                                    }
                                }
                            }}
                        >
                            {/* AI Label */}
                            <Text style={styles.aiIconText}>AI</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* AI Explanation Popup */}
                {showingExplanation && (
                    <View style={[
                        styles.aiExplanationPopup,
                        isOwnMessage ? styles.aiPopupRight : styles.aiPopupLeft
                    ]}>
                        <Text style={styles.aiExplanationText}>
                            <Text style={[styles.emotionWord, { color: toneColor }]}>
                                {item.tone.charAt(0).toUpperCase() + item.tone.slice(1)}
                            </Text>
                            {" - " + aiExplanation.explanation}
                        </Text>
                        {item.isEnhanced && (
                            <Text style={styles.enhancementBadge}>
                                Enhanced Analysis
                            </Text>
                        )}
                        <View style={[
                            styles.aiPopupArrow,
                            isOwnMessage ? styles.aiArrowRight : styles.aiArrowLeft
                        ]} />
                    </View>
                )}

                <Text style={[
                    styles.timestamp,
                    isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp
                ]}>
                    {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </Text>
            </View>
        );
    };



    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            {/* Header */}
            <View style={styles.header}>
                {/* Partner Profile */}
                <View style={styles.profileSection}>
                    <View style={[styles.profilePicture, styles.partnerProfilePicture]}>
                        <Text style={styles.profileInitial}>
                            {chatPartner.name.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <Text style={styles.profileName}>{chatPartner.name}</Text>
                </View>

                {/* Center - Back button only */}
                <View style={styles.centerSection}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={onBack}
                    >
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                </View>

                {/* User Profile */}
                <View style={styles.profileSection}>
                    <View style={[styles.profilePicture, styles.userProfilePicture]}>
                        <Text style={styles.profileInitial}>
                            {(currentUser?.displayName || currentUser?.email || "You").charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <Text style={styles.profileName}>You</Text>
                </View>
            </View>

            {/* Single Emotion Tracker - Both Dots Meet in Middle */}
            <View style={styles.singleEmotionTracker}>
                <View style={styles.emotionBar}>
                    {/* Single bar: Red → Orange → Green → Purple → Green → Orange → Red */}
                    <View style={styles.leftRedSection} />
                    <View style={styles.leftOrangeSection} />
                    <View style={styles.leftGreenSection} />
                    <View style={styles.centerPurpleSection} />
                    <View style={styles.rightGreenSection} />
                    <View style={styles.rightOrangeSection} />
                    <View style={styles.rightRedSection} />

                    {/* Subtle midpoint line */}
                    <View style={styles.midpointLine} />

                    {/* Partner's emotion indicator (left side, 0% to 50% based on their individual score) */}
                    <View style={[
                        styles.emotionIndicator,
                        { left: `${getPersonScore(chatPartner.id) / 2}%` }
                    ]}>
                        <View
                            style={[
                                styles.emotionDot,
                                styles.leftPersonDot,
                                {
                                    backgroundColor: getPersonTrackerColor(getPersonEmotion(chatPartner.id), true),
                                    shadowColor: getPersonTrackerColor(getPersonEmotion(chatPartner.id), true),
                                }
                            ]}
                        />
                    </View>

                    {/* Your emotion indicator (right side, 100% to 50% based on your individual score) */}
                    <View style={[
                        styles.emotionIndicator,
                        { left: `${100 - (getPersonScore(currentUser?.uid || currentUser?.id || "current_user") / 2)}%` }
                    ]}>
                        <View
                            style={[
                                styles.emotionDot,
                                styles.rightPersonDot,
                                {
                                    backgroundColor: getPersonTrackerColor(getPersonEmotion(currentUser?.uid || currentUser?.id || "current_user"), false),
                                    shadowColor: getPersonTrackerColor(getPersonEmotion(currentUser?.uid || currentUser?.id || "current_user"), false),
                                }
                            ]}
                        />
                    </View>
                </View>
                
                {/* Psychological Score Display (relative to both people's positions) */}
                <View style={styles.scoreDisplayContainer}>
                    <Text style={[styles.scoreDisplayText, { color: moodHealth?.color || '#4CAF50' }]}>
                        Relationship Health: {getRelativeRelationshipHealth()}/100
                    </Text>
                </View>
            </View>

            {/* Messages */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                style={styles.messagesList}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            />

            {/* Input */}
            <View style={styles.inputContainer}>
                {/* Tone Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                        <View style={styles.suggestionsHeader}>
                            <Text style={styles.suggestionsTitle}>💡 Suggested responses:</Text>
                            <TouchableOpacity onPress={() => setShowSuggestions(false)}>
                                <Text style={styles.dismissButton}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        {suggestions.map((suggestion, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.suggestionItem}
                                onPress={() => {
                                    setInputText(suggestion);
                                    setShowSuggestions(false);
                                }}
                            >
                                <Text style={styles.suggestionText}>{suggestion}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.textInput}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Type a message..."
                        placeholderTextColor="#666"
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, (!inputText.trim() || loading) && styles.disabledButton]}
                        onPress={sendMessage}
                        disabled={!inputText.trim() || loading}
                    >
                        <Text style={styles.sendButtonText}>
                            {loading ? "..." : "Send"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    header: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        padding: 16,
        paddingTop: 50,
        paddingBottom: 12, // Reduced to bring emotion tracker closer
        backgroundColor: "#1E1E1E",
        borderBottomWidth: 1,
        borderBottomColor: "#333",
    },
    profileSection: {
        alignItems: "center",
        flex: 0.25,
    },
    profilePicture: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#4A90E2",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
        borderWidth: 2,
    },
    partnerProfilePicture: {
        borderColor: "#FF00FF", // Bright Magenta/Fuchsia border for partner
    },
    userProfilePicture: {
        borderColor: "#000000", // Jet Black border for user
    },
    profileInitial: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        fontFamily: 'SF Pro Text',
    },
    profileName: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "500",
        textAlign: "center",
        fontFamily: 'SF Pro Text',
    },
    centerSection: {
        alignItems: "center",
        flex: 0.5,
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        color: "#4A90E2",
        fontSize: 14,
        fontWeight: "600",
        fontFamily: 'SF Pro Text',
    },
    singleEmotionTracker: {
        backgroundColor: "#1E1E1E",
        paddingVertical: 8, // Further reduced height
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#333",
    },
    trackerLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    leftLabel: {
        color: "#E8E8E8",
        fontSize: 12,
        fontWeight: "600",
        fontFamily: 'SF Pro Text',
    },
    rightLabel: {
        color: "#E8E8E8",
        fontSize: 12,
        fontWeight: "600",
        fontFamily: 'SF Pro Text',
    },
    emotionBar: {
        flexDirection: "row",
        height: 8, // Made thicker for better circular marker fit
        backgroundColor: "#333",
        borderRadius: 4,
        overflow: "hidden",
        position: "relative",
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 1,
    },
    // Left side progression: Red → Orange → Green → Blue (center)
    leftRedSection: {
        flex: 1,
        backgroundColor: "#A1232B", // � Crimson Rust - Most negative (left end)
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
    },
    leftOrangeSection: {
        flex: 1,
        backgroundColor: "#D9772B", // � Burnt Amber - Moving toward center
    },
    leftGreenSection: {
        flex: 1,
        backgroundColor: "#4A90A4", // � Slate Blue - Getting closer to center
    },
    centerPurpleSection: {
        flex: 1,
        backgroundColor: "#4CAF50", // � Blue - Center meeting point
    },
    // Right side progression: Blue (center) → Green → Orange → Red
    rightGreenSection: {
        flex: 1,
        backgroundColor: "#4A90A4", // � Slate Blue - Near center
    },
    rightOrangeSection: {
        flex: 1,
        backgroundColor: "#D9772B", // � Burnt Amber - Moving away from center
    },
    rightRedSection: {
        flex: 1,
        backgroundColor: "#A1232B", // � Crimson Rust - Most negative (right end)
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
    },
    
    // Psychological Health Bar Styles (0-100 scale)
    healthRedSection: {
        flex: 2, // 0-20: Poor communication
        backgroundColor: "#F44336", // Red - Poor relationship health
        borderTopLeftRadius: 2,
        borderBottomLeftRadius: 2,
    },
    healthOrangeSection: {
        flex: 1.5, // 20-35: Concerning
        backgroundColor: "#FF9800", // Orange - Some tension
    },
    healthYellowSection: {
        flex: 3, // 35-65: Neutral/Balanced  
        backgroundColor: "#FFC107", // Yellow - Balanced communication
    },
    healthGreenSection: {
        flex: 2, // 65-80: Good
        backgroundColor: "#8BC34A", // Light Green - Good relationship health
    },
    healthExcellentSection: {
        flex: 1.5, // 80-100: Excellent
        backgroundColor: "#4CAF50", // Bright Green - Excellent communication
        borderTopRightRadius: 2,
        borderBottomRightRadius: 2,
    },
    
    // Mood tracker specific styles
    centerScoreContainer: {
        alignItems: 'center',
        minWidth: 80,
    },
    scoreText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
        fontFamily: 'SF Pro Text',
        textAlign: 'center',
    },
    healthText: {
        fontSize: 10,
        fontWeight: "500",
        fontFamily: 'SF Pro Text',
        textAlign: 'center',
        marginTop: 2,
    },
    moodScoreDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: "#fff",
    },
    
    // Score display styles for psychological health tracking
    scoreDisplayContainer: {
        alignItems: 'center',
        marginTop: 4, // Further reduced spacing
        paddingVertical: 2,
    },
    scoreDisplayText: {
        fontSize: 11,
        fontWeight: '500',
        fontFamily: 'SF Pro Text',
        opacity: 0.8,
    },
    emotionIndicator: {
        position: "absolute",
        top: -3, // Adjusted for thicker bar (8px height)
        marginLeft: -7, // Centered for 14px wide dots
        zIndex: 10,
    },
    midpointLine: {
        position: "absolute",
        left: "50%",
        top: -4,
        width: 1,
        height: 16,
        backgroundColor: "rgba(255,255,255,0.4)",
        zIndex: 5,
        marginLeft: -0.5, // Center the line
    },
    emotionDot: {
        width: 14, // Slightly larger for better fit with 8px bar
        height: 14,
        borderRadius: 7, // Perfect circle
        backgroundColor: '#000000', // Will be overridden by individual colors
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 2,
        borderColor: "#fff",
    },
    leftPersonDot: {
        borderColor: "#fff",
        borderWidth: 2,
        borderRadius: 7, // Perfect circle for partner
    },
    rightPersonDot: {
        borderColor: "#fff", 
        borderWidth: 2,
        borderRadius: 7, // Perfect circle for user
    },
    messagesList: {
        flex: 1,
        paddingHorizontal: 16,
    },
    messageContainer: {
        marginVertical: 8,
        maxWidth: "65%",
    },
    ownMessageContainer: {
        alignSelf: "flex-end",
        alignItems: "flex-end",
    },
    otherMessageContainer: {
        alignSelf: "flex-start",
        alignItems: "flex-start",
        marginTop: 4,
    },
    messageBubble: {
        padding: 16,
        borderRadius: 20,
        marginBottom: 6,
        minWidth: 50,
        maxWidth: "100%",
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    ownBubble: {
        borderBottomRightRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 5 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
        elevation: 8,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.15)',
        borderLeftColor: 'rgba(255,255,255,0.1)',
        transform: [{ perspective: 1000 }, { rotateY: '1deg' }, { rotateX: '-0.5deg' }],
    },
    otherBubble: {
        borderBottomLeftRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: -2, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 6,
        borderTopWidth: 1,
        borderRightWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.12)',
        borderRightColor: 'rgba(255,255,255,0.08)',
        transform: [{ perspective: 1000 }, { rotateY: '-1deg' }, { rotateX: '0.5deg' }],
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
        fontWeight: '500',
        fontFamily: 'SF Pro Text',
    },
    aiButtonContainer: {
        alignItems: "flex-end",
        marginTop: 8,
        paddingTop: 8,
    },
    aiButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.15)",
        borderWidth: 0.5,
        borderColor: "rgba(255,255,255,0.2)",
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        alignSelf: 'flex-end',
        minWidth: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    aiIcon: {
        width: 20,
        height: 20,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    aiCentralNode: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#fff',
        position: 'absolute',
        zIndex: 3,
    },
    aiConnectionTop: {
        position: 'absolute',
        top: 2,
        left: 9,
        width: 1,
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.6)',
        zIndex: 1,
    },
    aiConnectionBottom: {
        position: 'absolute',
        bottom: 2,
        left: 9,
        width: 1,
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.6)',
        zIndex: 1,
    },
    aiConnectionLeft: {
        position: 'absolute',
        top: 9,
        left: 2,
        width: 6,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.6)',
        zIndex: 1,
    },
    aiConnectionRight: {
        position: 'absolute',
        top: 9,
        right: 2,
        width: 6,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.6)',
        zIndex: 1,
    },
    aiOuterNode: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: 'rgba(255,255,255,0.8)',
        position: 'absolute',
        zIndex: 2,
    },
    aiNodeTop: {
        top: 1,
        left: 8,
    },
    aiNodeBottom: {
        bottom: 1,
        left: 8,
    },
    aiNodeLeft: {
        top: 8,
        left: 1,
    },
    aiNodeRight: {
        top: 8,
        right: 1,
    },
    aiButtonActive: {
        backgroundColor: "rgba(255,255,255,0.35)",
        borderColor: "rgba(255,255,255,0.5)",
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    aiExplanationPopup: {
        backgroundColor: '#2C2C2C',
        borderRadius: 16,
        padding: 14,
        marginTop: 10,
        maxWidth: '82%',
        borderWidth: 0.5,
        borderColor: '#555',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 8,
        position: 'relative',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    aiPopupLeft: {
        alignSelf: 'flex-start',
        marginLeft: 8,
    },
    aiPopupRight: {
        alignSelf: 'flex-end',
        marginRight: 8,
    },
    aiExplanationText: {
        color: '#E8E8E8',
        fontSize: 13,
        lineHeight: 19,
        fontWeight: '400',
        fontFamily: 'SF Pro Text',
    },
    emotionWord: {
        fontWeight: 'bold',
        fontSize: 14,
        fontFamily: 'SF Pro Text',
    },
    aiPopupArrow: {
        position: 'absolute',
        top: -7,
        width: 0,
        height: 0,
        borderLeftWidth: 7,
        borderRightWidth: 7,
        borderBottomWidth: 7,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#2C2C2C',
    },
    aiArrowLeft: {
        left: 16,
    },
    aiArrowRight: {
        right: 16,
    },
    timestamp: {
        fontSize: 12,
        color: "#666",
        marginTop: 2,
        fontFamily: 'SF Pro Text',
    },
    ownTimestamp: {
        textAlign: "right",
    },
    otherTimestamp: {
        textAlign: "left",
    },
    inputContainer: {
        backgroundColor: "#1E1E1E",
        borderTopWidth: 1,
        borderTopColor: "#333",
        paddingBottom: Platform.OS === "ios" ? 34 : 16,
    },
    suggestionsContainer: {
        padding: 16,
        backgroundColor: "#2A2A2A",
        borderBottomWidth: 1,
        borderBottomColor: "#333",
    },
    suggestionsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    suggestionsTitle: {
        color: "#4A90E2",
        fontSize: 14,
        fontWeight: "600",
        fontFamily: 'SF Pro Text',
    },
    dismissButton: {
        color: "#666",
        fontSize: 16,
        fontWeight: "bold",
        fontFamily: 'SF Pro Text',
    },
    suggestionItem: {
        backgroundColor: "#333",
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    suggestionText: {
        color: "#fff",
        fontSize: 14,
        fontFamily: 'SF Pro Text',
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        padding: 16,
    },
    textInput: {
        flex: 1,
        backgroundColor: "#333",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: "#fff",
        maxHeight: 100,
        marginRight: 12,
        fontFamily: 'SF Pro Text',
    },
    sendButton: {
        backgroundColor: "#4A90E2",
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    disabledButton: {
        backgroundColor: "#666",
    },
    sendButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontFamily: 'SF Pro Text',
    },
    aiIconText: {
        color: '#fff',
        fontSize: 10,
        fontStyle: 'italic',
        fontWeight: '600',
        fontFamily: 'SF Pro Text',
    },
    aiEmotionText: {
        fontSize: 11,
        fontWeight: '700',
        fontFamily: 'SF Pro Text',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
    enhancementIndicator: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    enhancementText: {
        fontSize: 10,
    },
    enhancementBadge: {
        fontSize: 11,
        color: '#4A90A4',
        fontWeight: '600',
        marginTop: 4,
        textAlign: 'center',
    },
    searchContainer: {
        backgroundColor: "#1E1E1E",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#333",
        flexDirection: "row",
        alignItems: "center",
    },
    searchInput: {
        flex: 1,
        backgroundColor: "#333",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 14,
        color: "#fff",
        marginRight: 8,
        fontFamily: 'SF Pro Text',
    },
    clearSearchButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: "#666",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 32,
    },
    clearSearchText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
        fontFamily: 'SF Pro Text',
    },
    searchResultsContainer: {
        backgroundColor: "#2A2A2A",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#333",
    },
    searchResultsText: {
        color: "#4A90E2",
        fontSize: 12,
        fontWeight: "500",
        textAlign: "center",
        fontFamily: 'SF Pro Text',
    },
    highlightedText: {
        backgroundColor: "#FFD54F",
        color: "#000",
        fontWeight: "bold",
        borderRadius: 2,
        paddingHorizontal: 2,
        fontFamily: 'SF Pro Text',
    },
});
