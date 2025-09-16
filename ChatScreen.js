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
                    explanation: "This message has a positive, caring tone that shows genuine interest in the other person's wellbeing",
                },
                {
                    id: "2",
                    text: "I'm feeling a bit stressed about work lately.",
                    sender: userId,
                    timestamp: new Date(Date.now() - 3000000).toISOString(),
                    tone: "stressed",
                    toneConfidence: 0.78,
                    explanation: "This message expresses stress and anxiety, indicating the sender is dealing with workplace pressure",
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
                    tone: "sad",
                    toneConfidence: 0.76,
                    explanation: "This message conveys sadness and feeling overwhelmed by work pressures",
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
            ]);
        }, 500);
    }, []);

    const analyzeToneForMessage = async (text) => {
        try {
            const analysis = await analyzeTone(text);
            // Map to core emotions
            const coreEmotions = ['happy', 'sad', 'angry', 'excited', 'stressed', 'neutral'];
            let mappedTone = analysis.tone;

            // Map common variations to core emotions
            if (['positive', 'supportive', 'cheerful', 'joyful'].includes(analysis.tone)) {
                mappedTone = 'happy';
            } else if (['negative', 'frustrated', 'irritated'].includes(analysis.tone)) {
                mappedTone = 'angry';
            } else if (['anxious', 'worried', 'overwhelmed'].includes(analysis.tone)) {
                mappedTone = 'stressed';
            } else if (['down', 'melancholy', 'disappointed'].includes(analysis.tone)) {
                mappedTone = 'sad';
            } else if (['enthusiastic', 'thrilled', 'energetic'].includes(analysis.tone)) {
                mappedTone = 'excited';
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
            const coreEmotions = ['happy', 'sad', 'angry', 'excited', 'stressed', 'neutral'];
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
            // Enhanced 5 core emotions with richer, more vibrant colors
            happy: "#4CAF50",      // Vibrant green - positive/joyful
            sad: "#2196F3",        // Deep blue - melancholy/down
            angry: "#F44336",      // Bold red - frustration/anger
            excited: "#FF9800",    // Bright orange - enthusiasm/energy
            stressed: "#9C27B0",   // Rich purple - anxiety/overwhelmed
            neutral: "#607D8B",    // Blue-gray - balanced/calm

            // Map variations to core emotions
            positive: "#4CAF50",   // -> happy
            negative: "#F44336",   // -> angry
            supportive: "#4CAF50", // -> happy
            worried: "#9C27B0",    // -> stressed
            calm: "#607D8B",       // -> neutral
        };
        return toneColors[tone] || toneColors.neutral;
    };

    const getToneExplanation = (message) => {
        return message.explanation || `This message has a ${message.tone} tone with ${Math.round(message.toneConfidence * 100)}% confidence`;
    };

    // Calculate conversation emotion for the tracker
    const getConversationEmotion = () => {
        if (messages.length === 0) return 0.5; // neutral starting point
        
        const emotionValues = {
            angry: 0,      // Red end (negative)
            sad: 0.2,      // Towards red
            stressed: 0.3, // Slightly towards red
            neutral: 0.5,  // Middle (green)
            happy: 0.8,    // Towards green (positive)
            excited: 1.0   // Green end (very positive)
        };
        
        const totalValue = messages.reduce((sum, message) => {
            return sum + (emotionValues[message.tone] || 0.5);
        }, 0);
        
        return totalValue / messages.length;
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
                            <Text style={styles.aiButtonText}>AI</Text>
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
                            <Text style={styles.confidenceScore}>
                                {" "}({Math.round(item.toneConfidence * 100)}%)
                            </Text>
                            {" - " + item.explanation}
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

                {/* Center - Back button and Emotion Tracker */}
                <View style={styles.centerSection}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={onBack}
                    >
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                    
                    {/* Emotion Tracker */}
                    <View style={styles.emotionTracker}>
                        <View style={styles.emotionBar}>
                            <View 
                                style={[
                                    styles.emotionIndicator, 
                                    { 
                                        left: `${getConversationEmotion() * 100}%`,
                                        backgroundColor: getConversationEmotion() < 0.3 ? '#F44336' : 
                                                       getConversationEmotion() > 0.7 ? '#4CAF50' : '#FF9800',
                                        shadowColor: getConversationEmotion() < 0.3 ? '#F44336' : 
                                                   getConversationEmotion() > 0.7 ? '#4CAF50' : '#FF9800',
                                    }
                                ]} 
                            />
                        </View>
                        <Text style={styles.emotionLabel}>Conversation Mood</Text>
                    </View>
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
    },
    profileName: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "500",
        textAlign: "center",
    },
    centerSection: {
        alignItems: "center",
        flex: 0.5,
    },
    backButton: {
        padding: 8,
        marginBottom: 8,
    },
    emotionTracker: {
        alignItems: "center",
        width: 120,
    },
    emotionBar: {
        width: 100,
        height: 6,
        backgroundColor: "#333",
        borderRadius: 3,
        position: "relative",
        borderWidth: 1,
        borderColor: "#555",
        overflow: "hidden",
    },
    emotionIndicator: {
        position: "absolute",
        top: -1,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#4CAF50", // Will be dynamic based on position
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 4,
        marginLeft: -4, // Center the indicator
        borderWidth: 1,
        borderColor: "#fff",
    },
    emotionLabel: {
        color: "#aaa",
        fontSize: 10,
        marginTop: 4,
        textAlign: "center",
    },
    backButtonText: {
        color: "#4A90E2",
        fontSize: 14,
        fontWeight: "600",
    },
    messagesList: {
        flex: 1,
        paddingHorizontal: 16,
    },
    messageContainer: {
        marginVertical: 8,
        maxWidth: "65%", // Reduced from 70% to make bubbles even narrower
    },
    ownMessageContainer: {
        alignSelf: "flex-end",
        alignItems: "flex-end",
    },
    otherMessageContainer: {
        alignSelf: "flex-start",
        alignItems: "flex-start",
        marginTop: 4, // Slightly higher for other person's messages
    },
    messageBubble: {
        padding: 16,
        borderRadius: 20,
        marginBottom: 6,
        minWidth: 50,
        maxWidth: "100%",
        // Enhanced minimalist design
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    ownBubble: {
        borderBottomRightRadius: 8,
        // Enhanced 3D effect - more dramatic and polished
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 5 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
        elevation: 8,
        // Subtle depth with multiple shadows
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.15)',
        borderLeftColor: 'rgba(255,255,255,0.1)',
        // Clean gradient-like effect
        transform: [{ perspective: 1000 }, { rotateY: '1deg' }, { rotateX: '-0.5deg' }],
    },
    otherBubble: {
        borderBottomLeftRadius: 8,
        // Sophisticated 3D effect for received messages
        shadowColor: '#000',
        shadowOffset: { width: -2, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 6,
        // Different lighting effect for distinction
        borderTopWidth: 1,
        borderRightWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.12)',
        borderRightColor: 'rgba(255,255,255,0.08)',
        // Opposite subtle transform
        transform: [{ perspective: 1000 }, { rotateY: '-1deg' }, { rotateX: '0.5deg' }],
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
        fontWeight: '500',
    },
    ownMessageText: {
        color: "#fff",
    },
    otherMessageText: {
        color: "#fff",
    },
    aiButtonContainer: {
        alignItems: "flex-end",
        marginTop: 8,
        paddingTop: 8,
    },
    explainButton: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: "rgba(255,255,255,0.25)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
        marginRight: 6,
    },
    explainButtonText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "bold",
    },
    aiButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.15)",
        borderWidth: 0.5,
        borderColor: "rgba(255,255,255,0.2)",
        // Subtle 3D effect for button
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        alignSelf: 'flex-end',
    },
    aiButtonActive: {
        backgroundColor: "rgba(255,255,255,0.35)",
        borderColor: "rgba(255,255,255,0.5)",
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    aiButtonText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "bold",
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
    aiExplanationPopup: {
        backgroundColor: '#2C2C2C',
        borderRadius: 16,
        padding: 14,
        marginTop: 10,
        maxWidth: '82%',
        borderWidth: 0.5,
        borderColor: '#555',
        // Enhanced 3D effect for popup
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 8,
        position: 'relative',
        // Subtle inner border for depth
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
    },
    emotionWord: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    confidenceScore: {
        fontWeight: '600',
        fontSize: 12,
        color: '#B0B0B0',
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
        paddingBottom: Platform.OS === "ios" ? 34 : 16, // Account for home indicator
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
    },
    dismissButton: {
        color: "#666",
        fontSize: 16,
        fontWeight: "bold",
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
    },
});
