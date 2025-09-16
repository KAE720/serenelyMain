// AIShrinkScreen.js
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Animated
} from "react-native";

export default function AIShrinkScreen() {
    const [message, setMessage] = useState('');
    const [conversation, setConversation] = useState([
        {
            id: 1,
            type: 'ai',
            text: 'Hello! I\'m Serene. I\'m here to provide emotional support and guidance. How are you feeling today?'
        }
    ]);

    // Animation for soundwaves
    const waveAnim1 = new Animated.Value(0);
    const waveAnim2 = new Animated.Value(0);
    const waveAnim3 = new Animated.Value(0);

    useEffect(() => {
        // Create pulsing soundwave animation
        const createWaveAnimation = (animValue, delay) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.timing(animValue, {
                        toValue: 1,
                        duration: 1000,
                        delay: delay,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animValue, {
                        toValue: 0,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        // Start animations with different delays
        createWaveAnimation(waveAnim1, 0).start();
        createWaveAnimation(waveAnim2, 333).start();
        createWaveAnimation(waveAnim3, 666).start();
    }, []);

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
                text: 'Thank you for sharing. That sounds like a valid concern. Remember that your feelings are important and it\'s okay to take things one step at a time. I\'m here to listen.'
            };

            setConversation([...conversation, userMessage, aiResponse]);
            setMessage('');
        }
    };

    return (
        <View style={styles.container}>
            {/* Serene Character with Soundwaves */}
            <View style={styles.sereneContainer}>
                <Text style={styles.title}>Serene</Text>

                {/* Spirit/Woman outline */}
                <View style={styles.spiritContainer}>
                    {/* Simple woman silhouette */}
                    <View style={styles.spirit}>
                        <View style={styles.head} />
                        <View style={styles.body} />
                    </View>

                    {/* Animated soundwaves */}
                    <Animated.View
                        style={[
                            styles.soundwave,
                            styles.wave1,
                            { opacity: waveAnim1 }
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.soundwave,
                            styles.wave2,
                            { opacity: waveAnim2 }
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.soundwave,
                            styles.wave3,
                            { opacity: waveAnim3 }
                        ]}
                    />
                </View>
            </View>

            {/* AI Response Area */}
            <View style={styles.responseContainer}>
                <ScrollView style={styles.chatContainer}>
                    {conversation.slice(-3).map((msg) => ( // Show only last 3 messages
                        msg.type === 'ai' && (
                            <View key={msg.id} style={styles.aiResponse}>
                                <Text style={styles.responseText}>{msg.text}</Text>
                            </View>
                        )
                    ))}
                </ScrollView>
            </View>

            {/* Input Section */}
            <View style={styles.inputSection}>
                <TextInput
                    style={styles.input}
                    placeholder="Share your thoughts with Serene..."
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
    sereneContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#9C27B0",
        marginBottom: 20,
        textAlign: 'center',
        fontFamily: 'SF Pro Text',
    },
    spiritContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        height: 120,
        width: 120,
    },
    spirit: {
        alignItems: 'center',
        zIndex: 2,
    },
   
    soundwave: {
        position: 'absolute',
        borderWidth: 2,
        borderColor: '#9C27B0',
        borderRadius: 100,
        backgroundColor: 'transparent',
    },
    wave1: {
        width: 60,
        height: 60,
    },
    wave2: {
        width: 80,
        height: 80,
    },
    wave3: {
        width: 100,
        height: 100,
    },
    responseContainer: {
        flex: 1,
        marginBottom: 20,
    },
    chatContainer: {
        flex: 1,
    },
    aiResponse: {
        backgroundColor: '#1E1E1E',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#9C27B0',
    },
    responseText: {
        color: '#fff',
        fontSize: 16,
        lineHeight: 22,
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
        borderWidth: 1,
        borderColor: '#9C27B0',
    },
    sendButton: {
        backgroundColor: '#9C27B0',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontFamily: 'SF Pro Text',
    },
});
