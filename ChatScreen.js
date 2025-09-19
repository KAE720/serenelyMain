// ConversationScreen.js
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
    Dimensions,
    Linking
} from "react-native";

import llmService from "./llmService";
import { db, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, setDoc } from "./firebase";
import { getAuth } from "firebase/auth";

export default function ConversationScreen({ chatPartner, currentUser, onBack, conversationId }) {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(false);
    const [aiExplanation, setAiExplanation] = useState(null); // For AI popup
    const [isLLMReady, setIsLLMReady] = useState(false); // Track LLM status
    const [moodScore, setMoodScore] = useState(50); // Mood tracking score (0-100)
    const [moodHealth, setMoodHealth] = useState(null); // Health status object
    const [aiBubbleLayout, setAiBubbleLayout] = useState({}); // Fix: add missing state for AI dropdown layout
    // Track if dropdown needs to be above input
    const [showingDropdownAboveInput, setShowingDropdownAboveInput] = useState(false);
    const flatListRef = useRef(null);
    const auth = getAuth();
    const userId = currentUser?.uid || currentUser?.id || auth.currentUser?.uid || "current_user";
    const { width: screenWidth } = Dimensions.get('window');

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
            let currentScore = 50;


        });
        return unsubscribe;
    }, [conversationId]);

    // Initialize enhanced tone analysis and mock messages
    useEffect(() => {
        // Initialize the enhanced tone analysis service
        const initializeEnhancedAnalysis = async () => {
            try {
                // COPILOT INTEGRATION: Initialize the new LLM service
                await llmService.initialize();
                const llmStatus = llmService.getStatus();


                setIsLLMReady(llmStatus.initialized || false);
                console.log('AI Analysis initialized:', llmStatus.initialized ? 'LLM ready' : 'Using fallback');
            } catch (error) {
                console.error('Failed to initialize AI analysis:', error);
                setIsLLMReady(false);
            }
        };

        initializeEnhancedAnalysis();
    }, []);

    // Ensure last message's dropdown is always above input
    useEffect(() => {
        if (
            aiExplanation &&
            messages.length > 0 &&
            aiExplanation.messageId === messages[messages.length - 1].id
        ) {
            setShowingDropdownAboveInput(true);
            // Scroll so last message is fully visible above input
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } else {
            setShowingDropdownAboveInput(false);
        }
    }, [aiExplanation, messages]);

    const analyzeToneForMessage = async (text) => {
        try {
            const copilotAnalysis = await llmService.analyzeTone(text);
            const colorToEmotionMap = {
                'red': 'angry',
                'orange': 'stressed',
                'blue': 'neutral',
                'green': 'excited'
            };
            const mappedTone = colorToEmotionMap[copilotAnalysis.color] || 'neutral';
            const messageExplanation = await llmService.getExplainer(text, true);

            return {
                tone: mappedTone,
                confidence: copilotAnalysis.confidence,
                explanation: messageExplanation,
                isEnhanced: copilotAnalysis.isLLMEnhanced
            };
        } catch (error) {
            console.error("Enhanced tone analysis failed:", error);
            const fallbackExplanation = "Could not analyze tone.";

            return {
                tone: "neutral",
                confidence: 0.5,
                explanation: fallbackExplanation,
                isEnhanced: false
            };
        }
    };

    const sendMessage = async () => {
        if (!inputText.trim() || !conversationId) return;

        setLoading(true);
        const messageText = inputText.trim();
        setInputText("");

        try {
            const toneAnalysis = await analyzeToneForMessage(messageText);

            const messagesRef = collection(db, "conversations", conversationId, "messages");
            await addDoc(messagesRef, {
                text: messageText,
                sender: userId,
                timestamp: serverTimestamp(),
                tone: toneAnalysis.tone,
                toneConfidence: toneAnalysis.confidence,
                explanation: toneAnalysis.explanation,
                isEnhanced: toneAnalysis.isEnhanced || false,
            });

        } catch (error) {
            Alert.alert("Error", "Failed to send message");
            setInputText(messageText);
        } finally {
            setLoading(false);
        }
    };

    const getToneColor = (tone) => {
        const toneColors = {
            positive: "#1ABC9C",   // 🟢 Modern teal for positive
            excited: "#1ABC9C",    // Map excited to positive teal
            happy: "#1ABC9C",      // Map happy to positive teal
            neutral: "#3498DB",    // 🔵 Soft blue for neutral
            calm: "#3498DB",       // Map calm to neutral blue
            negative: "#E74C3C",   // 🔴 Warm red for negative
            angry: "#E74C3C",      // Map angry to negative red
            stressed: "#E74C3C",   // Map stressed to negative red
            sad: "#E74C3C",        // Map sad to negative red
            supportive: "#1ABC9C", // Map supportive to positive teal
            worried: "#E74C3C",    // Map worried to negative red
        };
        return toneColors[tone] || toneColors.neutral;
    };

    const getToneExplanation = (message) => {
        return message.explanation || `This message has a ${message.tone} tone.`;
    };

    // Calculate conversation emotion for each person separately - NEW SCORING SYSTEM
    const getPersonEmotion = (personId) => {
        const personMessages = messages.filter(msg => msg.sender === personId);
        if (personMessages.length === 0) return 0.5; // neutral starting point (50/100)
        let totalPoints = 50;
        personMessages.forEach(msg => {
            switch (msg.tone) {
                case 'excited':
                case 'happy':
                    totalPoints += 7.5;
                    break;
                case 'stressed':
                    totalPoints -= 3.5;
                    break;
                case 'angry':
                    totalPoints -= 15;
                    break;
                case 'neutral':
                    totalPoints += 1.5;
                    break;
                default:
                    totalPoints += 1.5;
                    break;
            }
        });
        totalPoints = Math.max(0, Math.min(100, totalPoints));
        return totalPoints / 100;
    };

    // Calculate individual person's score (0-100) - now uses the new scoring system
    const getPersonScore = (personId) => {
        const emotion = getPersonEmotion(personId);
        return Math.round(emotion * 100);
    };

    // Calculate relative relationship health
    const getRelativeRelationshipHealth = () => {
        const partnerScore = getPersonScore(chatPartner.id);
        const userScore = getPersonScore(currentUser?.uid || currentUser?.id || "current_user");

        const partnerDistanceFromCenter = Math.abs(50 - partnerScore);
        const userDistanceFromCenter = Math.abs(50 - userScore);

        const partnerCloseness = 50 - partnerDistanceFromCenter;
        const userCloseness = 50 - userDistanceFromCenter;

        const relationshipHealth = Math.round((partnerCloseness + userCloseness));

        return Math.max(0, Math.min(100, relationshipHealth));
    };

    const getPersonTrackerColor = (emotion, isPartner = false) => {
        if (isPartner) {
            return '#FF00FF';
        } else {
            return '#000000';
        }
    };

    const renderMessage = ({ item, index }) => {
        const isOwnMessage = item.sender === userId;
        const toneColor = getToneColor(item.tone);
        const showingExplanation = aiExplanation?.messageId === item.id;

        let formattedTime = "";
        if (item.timestamp) {
            let messageDate = item.timestamp.toDate ? item.timestamp.toDate() : new Date(item.timestamp);
            if (messageDate instanceof Date && !isNaN(messageDate)) {
                formattedTime = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
        }

        return (
            <View style={[styles.messageContainer, isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer]}>
                <View style={[styles.messageBubble, isOwnMessage ? styles.ownBubble : styles.otherBubble, { backgroundColor: toneColor }]}>
                    <Text style={styles.messageText}>{item.text ? String(item.text) : ''}</Text>
                    <View style={styles.messageFooter}>
                        <Text style={styles.messageTimestamp}>{formattedTime}</Text>
                        <TouchableOpacity
                            style={[styles.aiButton, showingExplanation && styles.aiButtonActive]}
                            onPress={async () => {
                                if (showingExplanation) {
                                    setAiExplanation(null);
                                } else {
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
                            <Text style={styles.aiIconText}>AI</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {showingExplanation && (
                    <View style={styles.aiExplanationPopup}>
                        <Text style={styles.aiExplanationText}>
                            <Text style={[styles.emotionWord, { color: toneColor }]}>
                                {item.tone ? String(item.tone.charAt(0).toUpperCase() + item.tone.slice(1)) : ''}
                            </Text>
                            {` - ${aiExplanation.explanation ? String(aiExplanation.explanation) : ''}`}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    // Phone call functionality
    async function ensurePhoneNumberExists(uid) {
        const userRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists() || !userDoc.data().phoneNumber) {
            Alert.prompt('Enter your phone number', 'You need to add your phone number to make calls.', async (value) => {
                if (value) {
                    await setDoc(userRef, { phoneNumber: value }, { merge: true });
                }
            });
        }
    }

    async function initiateCall(currentUid, recipientUid) {
        await ensurePhoneNumberExists(currentUid);
        const recipientRef = doc(db, 'users', recipientUid);
        const recipientDoc = await getDoc(recipientRef);
        if (!recipientDoc.exists() || !recipientDoc.data().phoneNumber) {
            Alert.alert('The other user hasn’t added a phone number yet.');
            return;
        }
        const phoneNumber = recipientDoc.data().phoneNumber;
        Linking.openURL(`tel:${phoneNumber}`);
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.header}>
                {/* Partner section: profile pic, call icon, name stacked vertically */}
                <View style={{ alignItems: 'center' }}>
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
                    {/* Partner name directly below profile pic/call icon */}
                    <Text style={[styles.profileName, { marginLeft: 0, marginTop: 2, textAlign: 'center' }]}>{chatPartner.name}</Text>
                </View>

                {/* Center - Back button only */}
                <View style={styles.centerSection}>
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                </View>

                {/* User section: profile pic and 'You' stacked vertically, right-aligned */}
                <View style={{ alignItems: 'center' }}>
                    <View style={[styles.profilePicture, styles.userProfilePicture]}>
                        <Text style={styles.profileInitial}>{(currentUser?.displayName || "You").charAt(0).toUpperCase()}</Text>
                    </View>
                    {/* 'You' label directly below profile pic */}
                    <Text style={[styles.profileName, { marginLeft: 0, marginTop: 2, textAlign: 'center' }]}>You</Text>
                </View>
            </View>
            <View style={styles.singleEmotionTracker}>
                <View style={styles.emotionBar}>
                    <View style={styles.leftRedSection} />
                    <View style={styles.leftOrangeSection} />
                    <View style={styles.leftGreenSection} />
                    <View style={styles.centerPurpleSection} />
                    <View style={styles.rightGreenSection} />
                    <View style={styles.midpointLine} />
                    <View style={[styles.emotionIndicator, { left: `${getPersonScore(chatPartner.id) / 2}%` }]}>
                        <View style={[styles.emotionDot, styles.leftPersonDot, { backgroundColor: getPersonTrackerColor(getPersonEmotion(chatPartner.id), true) }]} />
                    </View>
                    <View style={[styles.emotionIndicator, { left: `${100 - (getPersonScore(currentUser?.uid || "current_user") / 2)}%` }]}>
                        <View style={[styles.emotionDot, styles.rightPersonDot, { backgroundColor: getPersonTrackerColor(getPersonEmotion(currentUser?.uid || "current_user"), false) }]} />
                    </View>
                </View>
                <View style={styles.scoreDisplayContainer}>
                    <Text style={styles.scoreDisplayText}>
                        Relationship Health: {getRelativeRelationshipHealth()}/100
                    </Text>
                </View>
            </View>
            <View style={styles.messagesContainer}>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    style={styles.messagesList}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />
            </View>
            <View style={styles.inputContainer}>
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
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    header: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        padding: 16, paddingTop: 50, paddingBottom: 12, backgroundColor: "#1E1E1E",
        borderBottomWidth: 1, borderBottomColor: "#333",
    },
    profileSection: { flexDirection: 'row', alignItems: 'center' },
    profilePicture: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#9C27B0", alignItems: "center", justifyContent: "center", borderWidth: 2 },
    partnerProfilePicture: { borderColor: "#FF00FF" },
    userProfilePicture: { borderColor: "#000000" },
    profileInitial: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    profileName: { color: "#FFFFFF", fontSize: 16, fontWeight: "600", marginLeft: 10 },
    callButton: { backgroundColor: '#1ABC9C', borderRadius: 18, padding: 6, marginLeft: 10, alignItems: 'center', justifyContent: 'center', height: 36, width: 36 },
    centerSection: { flex: 1, alignItems: "center" },
    backButton: { padding: 8 },
    backButtonText: { color: "#9C27B0", fontSize: 14, fontWeight: "600" },
    singleEmotionTracker: {
        backgroundColor: "#1E1E1E", paddingVertical: 8, paddingHorizontal: 16,
        borderBottomWidth: 1, borderBottomColor: "#333",
    },
    emotionBar: {
        flexDirection: "row", height: 8, backgroundColor: "#333", borderRadius: 4,
        overflow: "hidden", position: "relative",
    },
    leftRedSection: { flex: 1, backgroundColor: "#E74C3C", borderTopLeftRadius: 4, borderBottomLeftRadius: 4, },
    leftOrangeSection: { flex: 1, backgroundColor: "#3498DB" },
    leftGreenSection: { flex: 1, backgroundColor: "#1ABC9C" },
    centerPurpleSection: { flex: 1, backgroundColor: "#3498DB" },
    rightGreenSection: { flex: 1, backgroundColor: "#E74C3C", borderTopRightRadius: 4, borderBottomRightRadius: 4, },
    midpointLine: { position: "absolute", left: "50%", top: -4, width: 1, height: 16, backgroundColor: "rgba(255,255,255,0.4)", zIndex: 5, marginLeft: -0.5, },
    emotionIndicator: { position: "absolute", top: -3, marginLeft: -7, zIndex: 10, },
    emotionDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#000000', borderWidth: 2, borderColor: "#fff" },
    leftPersonDot: { borderColor: "#fff", borderWidth: 2, borderRadius: 7, },
    rightPersonDot: { borderColor: "#fff", borderWidth: 2, borderRadius: 7, },
    scoreDisplayContainer: { alignItems: 'center', paddingVertical: 2 },
    scoreDisplayText: { fontSize: 11, fontWeight: '500', opacity: 0.8, color: '#4CAF50' },
    messagesContainer: { flex: 1, paddingHorizontal: 16, },
    messagesList: { flexGrow: 1, },
    messageContainer: { marginVertical: 4, maxWidth: "80%", },
    ownMessageContainer: { alignSelf: "flex-end", alignItems: "flex-end" },
    otherMessageContainer: { alignSelf: "flex-start", alignItems: "flex-start" },
    messageBubble: { padding: 8, borderRadius: 16, backgroundColor: '#3498DB', },
    ownBubble: { borderBottomRightRadius: 6 },
    otherBubble: { borderBottomLeftRadius: 6 },
    messageText: { fontSize: 14, color: '#FFFFFF' },
    messageFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
    messageTimestamp: { fontSize: 10, color: '#fff', opacity: 0.7, marginRight: 8 },
    aiButton: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.2)", minWidth: 28, alignItems: 'center', justifyContent: 'center' },
    aiIconText: { color: '#fff', fontSize: 11, fontWeight: '600' },
    aiButtonActive: { backgroundColor: "rgba(255,255,255,0.35)", },
    aiExplanationPopup: {
        backgroundColor: '#2C2C2C', borderRadius: 16, padding: 14, marginTop: 6, maxWidth: '95%', borderWidth: 0.5, borderColor: '#555', shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 6,
    },
    aiExplanationText: { color: '#E8E8E8', fontSize: 13, lineHeight: 19, },
    emotionWord: { fontWeight: 'bold', fontSize: 14, },
    inputContainer: {
        backgroundColor: "#1E1E1E", borderTopWidth: 1, borderTopColor: "#333",
        paddingBottom: Platform.OS === "ios" ? 44 : 28, flexDirection: "row", alignItems: "flex-end", padding: 16,
    },
    textInput: {
        flex: 1, backgroundColor: "#333", borderRadius: 20, paddingHorizontal: 16,
        paddingVertical: 12, fontSize: 16, color: "#fff", maxHeight: 100, marginRight: 12,
    },
    sendButton: {
        backgroundColor: "#9C27B0", borderRadius: 20, paddingHorizontal: 20, paddingVertical: 12, justifyContent: 'center',
    },
    disabledButton: { backgroundColor: "#666" },
    sendButtonText: { color: "#fff", fontWeight: "600" },
});
