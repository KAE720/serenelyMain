// AIShrinkScreen.js
import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView
} from "react-native";

export default function AIShrinkScreen() {
    const [message, setMessage] = useState('');
    const [conversation, setConversation] = useState([
        {
            id: 1,
            type: 'ai',
            text: 'Hello! I\'m here to provide emotional support and guidance. How are you feeling today?'
        }
    ]);

    const sendMessage = () => {
        if (message.trim()) {
            const userMessage = {
                id: Date.now(),
                type: 'user',
                text: message.trim()
            };

            // Simple AI response (you can integrate real AI later)
            const aiResponse = {
                id: Date.now() + 1,
                type: 'ai',
                text: 'Thank you for sharing. That sounds like a valid concern. Remember that your feelings are important and it\'s okay to take things one step at a time.'
            };

            setConversation([...conversation, userMessage, aiResponse]);
            setMessage('');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>AI Emotional Support</Text>

            <ScrollView style={styles.chatContainer}>
                {conversation.map((msg) => (
                    <View
                        key={msg.id}
                        style={[
                            styles.messageItem,
                            msg.type === 'user' ? styles.userMessage : styles.aiMessage
                        ]}
                    >
                        <Text style={styles.messageText}>{msg.text}</Text>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.inputSection}>
                <TextInput
                    style={styles.input}
                    placeholder="Share your thoughts..."
                    placeholderTextColor="#666"
                    value={message}
                    onChangeText={setMessage}
                    multiline
                />
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 20 },
    chatContainer: {
        flex: 1,
        marginBottom: 20,
    },
    messageItem: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        maxWidth: '80%',
    },
    userMessage: {
        backgroundColor: '#1976D2',
        alignSelf: 'flex-end',
    },
    aiMessage: {
        backgroundColor: '#1E1E1E',
        alignSelf: 'flex-start',
    },
    messageText: {
        color: '#fff',
        fontSize: 16,
    },
    inputSection: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    input: {
        flex: 1,
        backgroundColor: '#1E1E1E',
        color: '#fff',
        padding: 12,
        borderRadius: 8,
        marginRight: 10,
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: '#1976D2',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
});
