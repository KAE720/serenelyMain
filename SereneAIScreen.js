// SereneAIScreen.js
import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Animated,
    ScrollView,
} from "react-native";
import { queryLocalLLM } from "./localLLMService";

export default function SereneAIScreen({ currentUser }) {

    const [messages, setMessages] = useState([
        {
            id: "ai-0",
            sender: "serene",
            text: "Hi, I'm SereneAI. How can I help you today?",
            timestamp: new Date().toISOString(),
        },
    ]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef(null);

    const sendMessage = async () => {
        if (!inputText.trim()) return;
        const userMessage = {
            id: `user-${Date.now()}`,
            sender: currentUser?.uid || "user",
            text: inputText.trim(),
            timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setInputText("");
        setLoading(true);
        try {
            const aiResponse = await queryLocalLLM(userMessage.text, "cbt");
            setMessages((prev) => [
                ...prev,
                {
                    id: `ai-${Date.now()}`,
                    sender: "serene",
                    text: aiResponse,
                    timestamp: new Date().toISOString(),
                },
            ]);
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    id: `ai-${Date.now()}`,
                    sender: "serene",
                    text: "AI unavailable. Please try again later.",
                    timestamp: new Date().toISOString(),
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Animated rings should always be visible and keep animating
    // Make the whole screen scrollable like the message section
    // Remove fade out logic from AnimatedSereneRings
    const AnimatedSereneRings = () => {
        const ring1 = useRef(new Animated.Value(1)).current;
        const ring2 = useRef(new Animated.Value(1)).current;
        const ring3 = useRef(new Animated.Value(1)).current;
        useEffect(() => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(ring1, { toValue: 1.15, duration: 700, useNativeDriver: true }),
                    Animated.timing(ring1, { toValue: 1, duration: 700, useNativeDriver: true }),
                ])
            ).start();
            Animated.loop(
                Animated.sequence([
                    Animated.timing(ring2, { toValue: 1.12, duration: 900, useNativeDriver: true }),
                    Animated.timing(ring2, { toValue: 1, duration: 900, useNativeDriver: true }),
                ])
            ).start();
            Animated.loop(
                Animated.sequence([
                    Animated.timing(ring3, { toValue: 1.09, duration: 1100, useNativeDriver: true }),
                    Animated.timing(ring3, { toValue: 1, duration: 1100, useNativeDriver: true }),
                ])
            ).start();
        }, []);
        return (
            <View style={{
                height: 80,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 2,
            }}>
                <Animated.View style={{
                    position: 'absolute',
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    borderWidth: 3,
                    borderColor: '#C77DFF',
                    transform: [{ scale: ring1 }],
                    opacity: 0.85,
                }} />
                <Animated.View style={{
                    position: 'absolute',
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    borderWidth: 3,
                    borderColor: '#F6C1FF',
                    transform: [{ scale: ring2 }],
                    opacity: 0.7,
                }} />
                <Animated.View style={{
                    position: 'absolute',
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    borderWidth: 3,
                    borderColor: '#FFF1FB',
                    transform: [{ scale: ring3 }],
                    opacity: 0.6,
                }} />
            </View>
        );
    };

    // Render each message, without ring animation
    const renderMessage = ({ item }) => {
        const isSerene = item.sender === "serene";
        return (
            <View
                style={[
                    styles.messageContainer,
                    isSerene ? styles.aiMessage : styles.userMessage,
                ]}
            >
                <Text style={styles.messageText}>{item.text}</Text>
            </View>
        );
    };

    const hasMessages = messages.length > 1;
    // Change SereneAI screen layout so input stays fixed at the bottom
    // Use View for layout, FlatList for messages, and keep input fixed
    // Make messages grow upward as new ones come in
    // Use FlatList with normal order (not inverted)
    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (flatListRef.current && messages.length > 0) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    return (
        <View style={styles.container}>
            <View style={styles.headerCompact}>
                <AnimatedSereneRings />
                <Text style={styles.headerText}>SereneAI</Text>
                <Text style={styles.subHeaderText}>Your private AI therapist</Text>
            </View>
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                style={styles.messagesList}
                contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
            />
            <View style={styles.inputContainerFixed}>
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
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.sendButtonText}>Send</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerCompact: {
        paddingTop: 32,
        paddingBottom: 8,
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#333",
        minHeight: 90,
        backgroundColor: "transparent", // Remove black tab
    },
    headerText: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
        fontFamily: 'SF Pro Text',
    },
    subHeaderText: {
        color: '#aaa',
        fontSize: 14,
        marginTop: 2,
        marginBottom: 8,
        fontFamily: 'SF Pro Text',
        textAlign: 'center',
    },
    messagesSection: {
        flex: 1,
        width: '100%',
        minHeight: 200,
    },
    messagesList: {
        flex: 1,
        paddingHorizontal: 16,
        marginBottom: 80, // Ensure space for input
    },
    messageContainer: {
        marginVertical: 8,
        padding: 12,
        borderRadius: 12,
        maxWidth: '80%',
    },
    aiMessage: {
        backgroundColor: '#222',
        alignSelf: 'flex-start',
    },
    userMessage: {
        backgroundColor: '#007BFF',
        alignSelf: 'flex-end',
    },
    messageText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'SF Pro Text',
    },
    inputContainerFixed: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#333',
        backgroundColor: '#1E1E1E',
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
    },
    textInput: {
        flex: 1,
        backgroundColor: '#222',
        color: '#fff',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        fontFamily: 'SF Pro Text',
        marginRight: 8,
    },
    sendButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 8,
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'SF Pro Text',
    },
    disabledButton: {
        opacity: 0.5,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'space-between',
    },
    container: {
        flex: 1,
        backgroundColor: '#000',
        position: 'relative',
    },
});
