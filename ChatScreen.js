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
import { analyzeTone, getToneSuggestions } from "./services/toneAnalysisService";

export default function ChatScreen({ chatPartner, currentUser, onBack }) {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [aiExplanation, setAiExplanation] = useState(null); // For AI popup
    const flatListRef = useRef(null);

    // Mock initial messages
    useEffect(() => {
        // Simulate loading messages from backend
        setTimeout(() => {
            const userId = currentUser?.uid || currentUser?.id || "current_user";
            setMessages([
                {
                    id: "1",
                    text: "Hey, how are you doing today?",
                    sender: chatPartner.id,
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    tone: "happy",
                    toneConfidence: 0.85,
                    explanation: "This message has a warm, caring tone that shows genuine interest in the other person's wellbeing",
                },
                {
                    id: "2",
                    text: "I'm feeling a bit stressed about work lately.",
                    sender: userId,
                    timestamp: new Date(Date.now() - 3000000).toISOString(),
                    tone: "stressed",
                    toneConfidence: 0.78,
                    explanation: "This message expresses anxiety and worry, indicating the sender is dealing with workplace pressure",
                },
                {
                    id: "3",
                    text: "I'm sorry to hear that. Want to talk about it?",
                    sender: chatPartner.id,
                    timestamp: new Date(Date.now() - 2700000).toISOString(),
                    tone: "happy",
                    toneConfidence: 0.92,
                    explanation: "This message shows empathy and offers emotional support, creating a safe space for further discussion",
                },
                {
                    id: "4",
                    text: "Yeah, my boss has been really demanding lately and I feel overwhelmed.",
                    sender: userId,
                    timestamp: new Date(Date.now() - 2400000).toISOString(),
                    tone: "stressed",
                    toneConfidence: 0.76,
                    explanation: "This message conveys stress and feeling overwhelmed by work pressures",
                },
                {
                    id: "5",
                    text: "That sounds really tough. Have you thought about talking to HR?",
                    sender: chatPartner.id,
                    timestamp: new Date(Date.now() - 2100000).toISOString(),
                    tone: "neutral",
                    toneConfidence: 0.65,
                    explanation: "This message offers practical advice in a calm, balanced way",
                },
                {
                    id: "6",
                    text: "I love that you're always so supportive! 💕",
                    sender: userId,
                    timestamp: new Date(Date.now() - 1800000).toISOString(),
                    tone: "excited",
                    toneConfidence: 0.91,
                    explanation: "This message demonstrates high positive energy, love, and appreciation",
                },
            ]);
        }, 500);
    }, []);

    const analyzeToneForMessage = async (text) => {
        try {
            const analysis = await analyzeTone(text);
            // Map to 4 core emotions for dual tracker design
            const coreEmotions = ['angry', 'stressed', 'neutral', 'excited'];
            let mappedTone = analysis.tone;

            // Map common variations to our 4 core emotions
            if (['positive', 'supportive', 'cheerful', 'content', 'calm', 'joyful', 'loving', 'happy'].includes(analysis.tone)) {
                mappedTone = 'excited'; // All positive emotions -> excited (purple)
            } else if (['negative', 'frustrated', 'irritated', 'furious'].includes(analysis.tone)) {
                mappedTone = 'angry';
            } else if (['anxious', 'worried', 'overwhelmed', 'tense', 'sad', 'down', 'melancholy', 'disappointed'].includes(analysis.tone)) {
                mappedTone = 'stressed'; // Map anxiety and sadness to stressed (orange)
            } else if (!coreEmotions.includes(analysis.tone)) {
                mappedTone = 'neutral';
            }

            return {
                ...analysis,
                tone: mappedTone
            };
        } catch (error) {
            console.error("Tone analysis failed:", error);
            // Randomly assign a core emotion for demo purposes
            const coreEmotions = ['angry', 'stressed', 'neutral', 'excited'];
            const randomTone = coreEmotions[Math.floor(Math.random() * coreEmotions.length)];
            return {
                tone: randomTone,
                confidence: 0.7,
                explanation: `Demo: Detected ${randomTone} emotion`
            };
        }
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
            };

            setMessages(prev => [...prev, newMessage]);

            // Get suggestions for the partner based on the tone
            if (toneAnalysis.tone !== 'neutral') {
                const toneSuggestions = await getToneSuggestions(toneAnalysis.tone, messageText);
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
            // 4-emotion scale: Negative → Positive (Visually Distinctive)
            angry: "#D32F2F",      // 🔴 Red - Anger/Frustration (intense, negative)
            stressed: "#F57C00",   // 🟠 Orange - Stress/Anxiety (transitional, alert)
            neutral: "#388E3C",    // 🟢 Green - Calm/Content (balanced, soothing)
            excited: "#7B1FA2",    // 🟣 Purple - Joy/Love/Excitement (vibrant, passion)

            // Map legacy variations
            happy: "#7B1FA2",      // Map to excited (purple)
            sad: "#F57C00",        // Map to stressed (orange) - low-energy negative
            positive: "#7B1FA2",   // -> excited (purple)
            negative: "#D32F2F",   // -> angry (red)
            supportive: "#7B1FA2", // -> excited (purple)
            worried: "#F57C00",    // -> stressed (orange)
            calm: "#388E3C",       // -> neutral (green)
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

    // Calculate conversation emotion for each person separately - SYMMETRIC MEETING DESIGN
    const getPersonEmotion = (personId) => {
        const personMessages = messages.filter(msg => msg.sender === personId);
        if (personMessages.length === 0) return 0.67; // neutral starting point (green section)

        // 4-emotion progression: 0.0=angry, 0.33=stressed, 0.67=neutral, 1.0=excited (purple center)
        const emotionValues = {
            angry: 0.0,     // Far from center (most negative) - Red
            stressed: 0.33, // Moving toward center - Orange
            neutral: 0.67,  // Getting closer to center - Green
            excited: 1.0,   // Center (meeting point) - Purple

            // Legacy mappings
            happy: 1.0,     // Map to excited (purple)
            sad: 0.33,      // Map to stressed (orange)
        };

        const total = personMessages.reduce((sum, msg) => sum + (emotionValues[msg.tone] || 0.5), 0);
        return total / personMessages.length;
    };

    // Get dynamic color based on person's emotion (4-emotion symmetric gradient)
    const getPersonTrackerColor = (emotion) => {
        if (emotion <= 0.25) return '#D32F2F';    // 🔴 Red (angry)
        if (emotion <= 0.5) return '#F57C00';     // 🟠 Orange (stressed)
        if (emotion <= 0.75) return '#388E3C';    // 🟢 Green (neutral/calm)
        return '#7B1FA2';                         // 🟣 Purple (excited - center meeting point)
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

                    {/* AI button only */}
                    <View style={styles.aiButtonContainer}>
                        <TouchableOpacity
                            style={[styles.aiButton, showingExplanation && styles.aiButtonActive]}
                            onPress={() => {
                                if (showingExplanation) {
                                    setAiExplanation(null);
                                } else {
                                    setAiExplanation({
                                        messageId: item.id,
                                        tone: item.tone,
                                        explanation: getToneExplanation(item),
                                        color: toneColor
                                    });
                                }
                            }}
                        >
                            {/* AI Text Icon */}
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
                            {" - " + getToneExplanation(item)}
                        </Text>
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
                    <View style={styles.profilePicture}>
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
                    <View style={styles.profilePicture}>
                        <Text style={styles.profileInitial}>
                            {(currentUser?.displayName || currentUser?.email || "You").charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <Text style={styles.profileName}>You</Text>
                </View>
            </View>

            {/* Single Emotion Tracker - Both Dots Meet in Middle */}
            <View style={styles.singleEmotionTracker}>
                <View style={styles.trackerLabels}>
                    <Text style={styles.leftLabel}>{chatPartner.name}</Text>
                    <Text style={styles.rightLabel}>You</Text>
                </View>

                <View style={styles.emotionBar}>
                    {/* Single bar: Red → Orange → Green → Purple → Green → Orange → Red */}
                    <View style={styles.leftRedSection} />
                    <View style={styles.leftOrangeSection} />
                    <View style={styles.leftGreenSection} />
                    <View style={styles.centerPurpleSection} />
                    <View style={styles.rightGreenSection} />
                    <View style={styles.rightOrangeSection} />
                    <View style={styles.rightRedSection} />

                    {/* Partner's emotion indicator (left side, never crosses past 50%) */}
                    <View style={[
                        styles.emotionIndicator,
                        { left: `${Math.min(getPersonEmotion(chatPartner.id) * 50, 50)}%` }
                    ]}>
                        <View
                            style={[
                                styles.emotionDot,
                                styles.leftPersonDot,
                                {
                                    backgroundColor: getPersonTrackerColor(getPersonEmotion(chatPartner.id)),
                                    shadowColor: getPersonTrackerColor(getPersonEmotion(chatPartner.id)),
                                }
                            ]}
                        />
                    </View>

                    {/* Your emotion indicator (right side, never crosses past 50%) */}
                    <View style={[
                        styles.emotionIndicator,
                        { left: `${Math.max(50 + (getPersonEmotion(currentUser?.uid || currentUser?.id || "current_user") * 50), 50)}%` }
                    ]}>
                        <View
                            style={[
                                styles.emotionDot,
                                styles.rightPersonDot,
                                {
                                    backgroundColor: getPersonTrackerColor(getPersonEmotion(currentUser?.uid || currentUser?.id || "current_user")),
                                    shadowColor: getPersonTrackerColor(getPersonEmotion(currentUser?.uid || currentUser?.id || "current_user")),
                                }
                            ]}
                        />
                    </View>
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
        paddingBottom: 20,
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
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#333",
    },
    trackerLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
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
        height: 4, // Made even thinner as requested
        backgroundColor: "#333",
        borderRadius: 2,
        overflow: "hidden",
        position: "relative",
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 1,
    },
    // Left side progression: Red → Orange → Green → Purple (center)
    leftRedSection: {
        flex: 1,
        backgroundColor: "#D32F2F", // 🔴 Red - Most negative (left end)
        borderTopLeftRadius: 2,
        borderBottomLeftRadius: 2,
    },
    leftOrangeSection: {
        flex: 1,
        backgroundColor: "#F57C00", // 🟠 Orange - Moving toward center
    },
    leftGreenSection: {
        flex: 1,
        backgroundColor: "#388E3C", // � Green - Getting closer to center
    },
    centerPurpleSection: {
        flex: 1,
        backgroundColor: "#7B1FA2", // 🟣 Purple - Center meeting point
    },
    // Right side progression: Purple (center) → Green → Orange → Red
    rightGreenSection: {
        flex: 1,
        backgroundColor: "#388E3C", // 🟢 Green - Near center
    },
    rightOrangeSection: {
        flex: 1,
        backgroundColor: "#F57C00", // 🟠 Orange - Moving away from center
    },
    rightRedSection: {
        flex: 1,
        backgroundColor: "#D32F2F", // 🔴 Red - Most negative (right end)
        borderTopRightRadius: 2,
        borderBottomRightRadius: 2,
    },
    emotionIndicator: {
        position: "absolute",
        top: -1, // Adjusted for thinner bar
        marginLeft: -4,
        zIndex: 10,
    },
    emotionDot: {
        width: 8, // Smaller for thinner bar
        height: 8,
        borderRadius: 4,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1.5,
        borderColor: "#fff",
    },
    leftPersonDot: {
        borderColor: "#fff",
        borderWidth: 2,
    },
    rightPersonDot: {
        borderColor: "#fff",
        borderWidth: 2,
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
        paddingHorizontal: 8,
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
        minWidth: 32,
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
