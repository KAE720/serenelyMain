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
                    tone: "positive",
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
                    tone: "supportive",
                    toneConfidence: 0.92,
                    explanation: "This message shows empathy and offers emotional support, creating a safe space for further discussion",
                },
            ]);
        }, 500);
    }, []);

    const analyzeToneForMessage = async (text) => {
        try {
            const analysis = await analyzeTone(text);
            return analysis;
        } catch (error) {
            console.error("Tone analysis failed:", error);
            return {
                tone: "neutral",
                confidence: 0.5,
                explanation: "Unable to analyze tone"
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
            positive: "#4CAF50",
            negative: "#F44336",
            neutral: "#9E9E9E",
            excited: "#FF9800",
            sad: "#3F51B5",
            angry: "#E91E63",
            supportive: "#8BC34A",
            stressed: "#FF5722",
        };
        return toneColors[tone] || "#9E9E9E";
    };

    const getToneExplanation = (message) => {
        return message.explanation || `This message has a ${message.tone} tone with ${Math.round(message.toneConfidence * 100)}% confidence`;
    };

    const renderMessage = ({ item }) => {
        const userId = currentUser?.uid || currentUser?.id || "current_user";
        const isOwnMessage = item.sender === userId;
        const toneColor = getToneColor(item.tone);

        return (
            <View style={[
                styles.messageContainer,
                isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
            ]}>
                <View style={[
                    styles.messageBubble,
                    isOwnMessage ? styles.ownBubble : styles.otherBubble,
                    { backgroundColor: `${toneColor}20` }, // Light version of tone color
                    { borderColor: toneColor }
                ]}>
                    <Text style={[
                        styles.messageText,
                        isOwnMessage ? styles.ownMessageText : styles.otherMessageText
                    ]}>
                        {item.text}
                    </Text>

                    {/* Tone indicator */}
                    <View style={styles.toneContainer}>
                        <View style={[styles.toneIndicator, { backgroundColor: toneColor }]} />
                        <Text style={styles.toneText}>
                            {item.tone} ({Math.round(item.toneConfidence * 100)}%)
                        </Text>
                        <TouchableOpacity
                            style={styles.explainButton}
                            onPress={() => Alert.alert("Tone Explanation", getToneExplanation(item))}
                        >
                            <Text style={styles.explainButtonText}>?</Text>
                        </TouchableOpacity>
                    </View>
                </View>

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
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={onBack}
                >
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{chatPartner.name}</Text>
                <View style={styles.headerRight} />
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
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        paddingTop: 50,
        backgroundColor: "#1E1E1E",
        borderBottomWidth: 1,
        borderBottomColor: "#333",
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        color: "#4A90E2",
        fontSize: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#fff",
    },
    headerRight: {
        width: 60,
    },
    messagesList: {
        flex: 1,
        paddingHorizontal: 16,
    },
    messageContainer: {
        marginVertical: 8,
        maxWidth: "80%",
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
        padding: 12,
        borderRadius: 16,
        marginBottom: 4,
        borderWidth: 2,
    },
    ownBubble: {
        backgroundColor: "#4A90E2",
        borderBottomRightRadius: 4,
    },
    otherBubble: {
        backgroundColor: "#333",
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 20,
    },
    ownMessageText: {
        color: "#fff",
    },
    otherMessageText: {
        color: "#fff",
    },
    toneContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.1)",
    },
    toneIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    toneText: {
        fontSize: 12,
        color: "#ccc",
        flex: 1,
    },
    explainButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "#666",
        alignItems: "center",
        justifyContent: "center",
    },
    explainButtonText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
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
