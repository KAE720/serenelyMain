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



import { db, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "./firebase";
import { getAuth } from "firebase/auth";
import llmUnifiedService from './LLMUnifiedService';

export default function ChatScreen({ chatPartner, currentUser, onBack, conversationId }) {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(false);
    const [aiExplanation, setAiExplanation] = useState(null); // For AI popup
    const [isLLMReady, setIsLLMReady] = useState(false); // Track LLM status
    const [moodScore, setMoodScore] = useState(50); // Mood tracking score (0-100)
    const [moodHealth, setMoodHealth] = useState(null); // Health status object
    const flatListRef = useRef(null);
    const auth = getAuth();
    const userId = currentUser?.uid || currentUser?.id || auth.currentUser?.uid || "current_user";

    // Real-time Firestore listener for messages
    useEffect(() => {
        if (!conversationId) return;
        const messagesRef = collection(db, "conversations", conversationId, "messages");
        const q = query(messagesRef, orderBy("timestamp", "asc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const msgs = [];
            querySnapshot.forEach((doc) => {
                msgs.push({ id: doc.id, ...doc.data() });
            });
            setMessages(msgs);
            // Mood tracking with real messages


        });
        return unsubscribe;
    }, [conversationId]);



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
        if (!inputText.trim() || !conversationId) return;

        setLoading(true);
        const messageText = inputText.trim();
        setInputText("");

        try {
            // Analyze tone
            const toneAnalysis = await analyzeToneForMessage(messageText);

            // Add message to Firestore
            const messagesRef = collection(db, "conversations", conversationId, "messages");
            await addDoc(messagesRef, {
                text: messageText,
                sender: userId,
                timestamp: serverTimestamp(),
                tone: toneAnalysis.tone,
                toneConfidence: toneAnalysis.confidence,
                explanation: toneAnalysis.explanation,

            });

        } catch (error) {
            Alert.alert("Error", "Failed to send message");
            setInputText(messageText); // Restore text on error
        } finally {
            setLoading(false);
        }
    };

    const getToneColor = (tone) => {
        const toneColors = {
            // Rich, vibrant colors that are not too bright
            angry: "#DC3545",      // 🔴 Rich red - clear negative emotion
            stressed: "#DC3545",   // 🔴 Same rich red for stressed emotions
            neutral: "#007BFF",    // 🔵 Rich blue - clear neutral tone
            excited: "#28A745",    // 🟢 Rich green - distinct positive emotion

            // Map legacy variations
            happy: "#28A745",      // Map to excited (rich green)
            sad: "#DC3545",        // Map to negative (rich red)
            positive: "#28A745",   // -> excited (rich green)
            negative: "#DC3545",   // -> angry (rich red)
            supportive: "#28A745", // -> excited (rich green)
            worried: "#DC3545",    // -> stressed (rich red)
            calm: "#007BFF",       // -> neutral (rich blue)
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
            switch (msg.tone) {
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
                    { backgroundColor: toneColor }
                ]}>
                    <Text style={styles.messageText}>
                        {item.text}
                    </Text>
                    {/* Timestamp inside bubble, opposite side of AI button */}
                    <Text style={[
                        styles.timestamp,
                        styles.timestampInsideBubble,
                        isOwnMessage ? styles.timestampLeft : styles.timestampRight
                    ]}>
                        {item.timestamp && item.timestamp.seconds
                            ? new Date(item.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '...'}
                    </Text>
                    {/* AI button only, no phone icon in bubble */}
                    <View style={styles.aiButtonContainer}>
                        <TouchableOpacity
                            style={[styles.aiButton, showingExplanation && styles.aiButtonActive]}
                            onPress={async () => {
                                if (showingExplanation) {
                                    setAiExplanation(null);
                                } else {
                                    setAiExplanation({
                                        messageId: item.id,
                                        explanation: getToneExplanation(item)
                                    });
                                }
                            }}
                        >
                            <Text style={styles.aiIconText}>AI</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {/* AI explanation popup */}
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
                        <View style={[
                            styles.aiPopupArrow,
                            isOwnMessage ? styles.aiArrowRight : styles.aiArrowLeft
                        ]} />
                    </View>
                )}
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
                <View style={styles.profileSection}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={[styles.profilePicture, styles.partnerProfilePicture]}>
                            <Text style={styles.profileInitial}>{chatPartner.name.charAt(0).toUpperCase()}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.callButton}
                            onPress={() => initiateCall(userId, chatPartner.id)}
                        >
                            <Text style={{ fontSize: 22, color: '#fff' }}>📞</Text>
                        </TouchableOpacity>
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
                    {/* Progress bar: Red → Blue → Green → Blue → Red (5 sections) */}
                    <View style={styles.leftRedSection} />
                    <View style={styles.leftOrangeSection} />
                    <View style={styles.leftGreenSection} />
                    <View style={styles.centerPurpleSection} />
                    <View style={styles.rightGreenSection} />

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
        backgroundColor: "#9C27B0",
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
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "600",
        textAlign: "center",
        fontFamily: 'SF Pro Text',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 0.5 },
        textShadowRadius: 0.5,
    },
    centerSection: {
        alignItems: "center",
        flex: 0.5,
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        color: "#9C27B0",
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
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "700",
        fontFamily: 'SF Pro Text',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 0.5 },
        textShadowRadius: 0.5,
    },
    rightLabel: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "700",
        fontFamily: 'SF Pro Text',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 0.5 },
        textShadowRadius: 0.5,
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
    // Progress bar: Red → Blue → Green → Blue → Red
    leftRedSection: {
        flex: 1,
        backgroundColor: "#DC3545", // 🔴 Rich red - most negative (left end)
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
    },
    leftOrangeSection: {
        flex: 1,
        backgroundColor: "#007BFF", // 🔵 Rich blue - transitioning toward center
    },
    leftGreenSection: {
        flex: 1,
        backgroundColor: "#28A745", // 🟢 Rich green - center positive zone
    },
    centerPurpleSection: {
        flex: 1,
        backgroundColor: "#007BFF", // 🔵 Rich blue - transitioning from center
    },
    // Right side: Blue → Red
    rightGreenSection: {
        flex: 1,
        backgroundColor: "#DC3545", // 🔴 Rich red - most negative (right end)
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
    },
    rightOrangeSection: {
        flex: 0, // Remove this section to make it Red-Blue-Green-Blue-Red
        backgroundColor: "transparent",
    },
    rightRedSection: {
        flex: 0, // Remove this section to make it Red-Blue-Green-Blue-Red
        backgroundColor: "transparent",
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
        fontWeight: "800",
        fontFamily: 'SF Pro Text',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 0.5 },
        textShadowRadius: 0.5,
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
        marginVertical: 2,
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
        padding: 8,
        borderRadius: 16,
        marginBottom: 2,
        minWidth: 60,
        maxWidth: "100%",
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    ownBubble: {
        borderBottomRightRadius: 6,
        alignSelf: 'flex-end',
    },
    otherBubble: {
        borderBottomLeftRadius: 6,
        alignSelf: 'flex-start',
    },
    messageText: {
        fontSize: 14,
        lineHeight: 18,
        fontWeight: '500',
        color: '#FFFFFF',
        fontFamily: 'SF Pro Text',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 0.5 },
        textShadowRadius: 1,
    },
    aiButtonContainer: {
        alignItems: "flex-end",
        marginTop: 2,
    },
    aiButton: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignSelf: 'flex-end',
        marginTop: 2,
        minWidth: 28,
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
    timestampInsideBubble: {
        position: 'absolute',
        bottom: 6,
        fontSize: 12,
        color: '#eee',
        opacity: 0.8,
    },
    timestampLeft: {
        left: 10,
        textAlign: 'left',
    },
    timestampRight: {
        right: 10,
        textAlign: 'right',
    },
    inputContainer: {
        backgroundColor: "#1E1E1E",
        borderTopWidth: 1,
        borderTopColor: "#333",
        paddingBottom: Platform.OS === "ios" ? 34 : 16,
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
        backgroundColor: "#9C27B0",
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
        fontSize: 11,
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
        color: "#9C27B0",
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
    callButton: {
        backgroundColor: '#222',
        borderRadius: 20,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
        marginRight: 0,
    },
    callIcon: {
        fontSize: 32,
        color: '#8e44ad',
    },
});

// Analyze tone using unified LLM service
const analyzeToneForMessage = async (messageText) => {
    try {
        // Use the unified service for tone analysis and explanation
        const toneResult = await llmUnifiedService.analyzeTone(messageText);
        const explanation = await llmUnifiedService.getExplainer(messageText, userId === chatPartner.id);
        return {
            tone: toneResult?.tone || 'neutral',
            confidence: toneResult?.confidence || 0.8,
            explanation: explanation || '',
        };
    } catch (err) {
        // Fallback to local helper if LLM fails
        return {
            tone: llmUnifiedService.normalizeSentiment(messageText),
            confidence: 0.7,
            explanation: llmUnifiedService.getFallbackResponse(messageText, 'explanation'),
        };
    }
};
