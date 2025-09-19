// ChatScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from "react-native";
import { db, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "./firebase";
import { getAuth } from "firebase/auth";
import llmUnifiedService from './LLMUnifiedService';


// ACTUAL MESSAGES SCREEN
export default function ChatScreen({ chatPartner, currentUser, onBack, conversationId }) {
    // State for messages and input
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(false);
    const [aiExplanation, setAiExplanation] = useState(null); // For AI popup
    const flatListRef = useRef(null);
    const auth = getAuth();
    const userId = currentUser?.uid || auth.currentUser?.uid || "current_user";

    // Listen for new messages in Firestore
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
        });
        return unsubscribe;
    }, [conversationId]);

    // Send a new message
    const sendMessage = async () => {
        if (!inputText.trim() || !conversationId) return;
        setLoading(true);
        const messageText = inputText.trim();
        setInputText("");
        try {
            // Get tone and explanation from LLM
            const toneResult = await llmUnifiedService.analyzeTone(messageText);
            const explanation = await llmUnifiedService.getExplainer(messageText);
            // Save message to Firestore
            const messagesRef = collection(db, "conversations", conversationId, "messages");
            await addDoc(messagesRef, {
                text: messageText,
                sender: userId,
                timestamp: serverTimestamp(),
                tone: toneResult?.tone || 'neutral',
                explanation: explanation || '',
            });
        } catch (error) {
            Alert.alert("Error", "Failed to send message");
            setInputText(messageText); // Restore text on error
        } finally {
            setLoading(false);
        }
    };

    // Get color for message bubble based on tone
    const getToneColor = (tone) => {
        const toneColors = {
            angry: "#DC3545",
            stressed: "#DC3545",
            neutral: "#007BFF",
            excited: "#28A745",
            happy: "#28A745",
            sad: "#DC3545",
            positive: "#28A745",
            negative: "#DC3545",
        };
        return toneColors[tone] || toneColors.neutral;
    };

    // Render each message
    const renderMessage = ({ item, index }) => {
        const isOwnMessage = item.sender === userId;
        const toneColor = getToneColor(item.tone);
        const showingExplanation = aiExplanation?.messageId === item.id;
        const isLastMessage = index === messages.length - 1;

        return (
            <View style={[styles.messageContainer, isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer]}>
                <View style={[styles.messageBubble, isOwnMessage ? styles.ownBubble : styles.otherBubble, { backgroundColor: toneColor, marginBottom: isLastMessage ? 2 : 2 }]}>
                    <Text style={styles.messageText}>{item.text}</Text>
                    <Text style={[styles.timestamp, styles.timestampInsideBubble, isOwnMessage ? styles.timestampLeft : styles.timestampRight]}>
                        {item.timestamp && item.timestamp.seconds
                            ? new Date(item.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '...'}
                    </Text>
                    <View style={styles.aiButtonContainer}>
                        <TouchableOpacity
                            style={[styles.aiButton, showingExplanation && styles.aiButtonActive]}
                            onPress={() => {
                                if (showingExplanation) {
                                    setAiExplanation(null);
                                } else {
                                    setAiExplanation({
                                        messageId: item.id,
                                        explanation: item.explanation || '',
                                    });
                                }
                            }}
                        >
                            <Text style={styles.aiIconText}>AI</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {showingExplanation && (
                    <View style={[styles.aiExplanationPopup, isOwnMessage ? styles.aiPopupRight : styles.aiPopupLeft]}>
                        <Text style={styles.aiExplanationText}>{item.explanation}</Text>
                        <View style={[styles.aiPopupArrow, isOwnMessage ? styles.aiArrowRight : styles.aiArrowLeft]} />
                    </View>
                )}
            </View>
        );
    };

    // Helper: Calculate a simple emotion score for each person
    const getPersonScore = (personId) => {
        const personMessages = messages.filter(msg => msg.sender === personId);
        if (personMessages.length === 0) return 50; // Neutral
        let score = 50;
        personMessages.forEach(msg => {
            switch (msg.tone) {
                case 'excited':
                case 'happy':
                case 'positive':
                    score += 7;
                    break;
                case 'stressed':
                case 'angry':
                case 'negative':
                case 'sad':
                    score -= 10;
                    break;
                case 'neutral':
                default:
                    score += 1;
                    break;
            }
        });
        return Math.max(0, Math.min(100, score));
    };

    // Helper: Relationship health is how close both are to center (50)
    const getRelationshipHealth = () => {
        const partnerScore = getPersonScore(chatPartner.id);
        const userScore = getPersonScore(userId);
        const closeness = 100 - (Math.abs(50 - partnerScore) + Math.abs(50 - userScore)) / 2;
        return Math.round(closeness);
    };

    // Main UI
    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            {/* Header with chat partner, call button, and back button */}
            <View style={styles.header}>
                <View style={styles.profileSection}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={[styles.profilePicture, styles.partnerProfilePicture]}>
                            <Text style={styles.profileInitial}>{chatPartner.name.charAt(0).toUpperCase()}</Text>
                        </View>
                        {/* Large call button directly beside profile pic */}
                        <TouchableOpacity style={styles.largeCallButton}>
                            <Text style={styles.largeCallIcon}>📞</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.profileName}>{chatPartner.name}</Text>
                </View>
                <View style={styles.centerSection}>
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.profileSection}>
                    <View style={[styles.profilePicture, styles.userProfilePicture]}>
                        <Text style={styles.profileInitial}>{(currentUser?.displayName || currentUser?.email || "You").charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.profileName}>You</Text>
                </View>
            </View>

            {/* Progress tracker bar (emotion tracker) - moved higher up */}
            <View style={styles.progressBarContainer}>
                <View style={styles.singleEmotionTracker}>
                    <View style={styles.emotionBar}>
                        <View style={styles.leftRedSection} />
                        <View style={styles.leftOrangeSection} />
                        <View style={styles.leftGreenSection} />
                        <View style={styles.centerPurpleSection} />
                        <View style={styles.rightGreenSection} />
                        <View style={styles.midpointLine} />
                        {/* Partner's dot */}
                        <View style={[styles.emotionIndicator, { left: `${getPersonScore(chatPartner.id) / 2}%` }]}>
                            <View style={[styles.emotionDot, styles.leftPersonDot, { backgroundColor: '#FF00FF' }]} />
                        </View>
                        {/* User's dot */}
                        <View style={[styles.emotionIndicator, { left: `${100 - (getPersonScore(userId) / 2)}%` }]}>
                            <View style={[styles.emotionDot, styles.rightPersonDot, { backgroundColor: '#000' }]} />
                        </View>
                    </View>
                    {/* Relationship health tracker */}
                    <View style={styles.scoreDisplayContainer}>
                        <Text style={[styles.scoreDisplayText, { color: '#fff' }]}>Connection: {getRelationshipHealth()}/100</Text>
                    </View>
                </View>
            </View>

            {/* Messages list */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={({ item, index }) => renderMessage({ item, index })}
                keyExtractor={(item) => item.id}
                style={styles.messagesList}
                contentContainerStyle={{ paddingBottom: (aiExplanation && messages.length > 0 && aiExplanation.messageId === messages[messages.length - 1].id) ? 140 : 80 }} // Extra padding if AI explanation for last message
                showsVerticalScrollIndicator={false}
                initialScrollIndex={messages.length > 0 ? messages.length - 1 : 0}
                getItemLayout={(data, index) => ({ length: 70, offset: 70 * index, index })} // Approximate row height for fast scroll
            />

            {/* Input area */}
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
                        <Text style={styles.sendButtonText}>{loading ? "..." : "Send"}</Text>
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
    singleEmotionTracker: { //PROGRESS BAR

        paddingVertical: 1,
        width: '100%', // Ensure full width
        alignSelf: 'stretch',
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
        height: 8,
        backgroundColor: "#333",
        borderRadius: 0,
        overflow: "hidden",
        position: "relative",
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 1,
        width: '100%', // Ensure full width
        alignSelf: 'stretch', // Ensure full width
        marginLeft: 0,
        marginRight: 0,
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
    largeCallButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#222',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
        marginRight: 0,
    },
    largeCallIcon: {
        fontSize: 32,
        color: '#8e44ad',
    },
    progressBarContainer: {
        marginTop: 0,
        marginBottom: 8,
        paddingHorizontal: 0,
        width: '100%', // Ensure full width
        alignSelf: 'stretch',
    },
});
