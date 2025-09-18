import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Modal,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import enhancedLLMService from './enhancedLLMService';
import demoLLMService from './demoLLMService'; // Demo service for testing

export default function CBTTherapistScreen({ visible, onClose, userName }) {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [showTechnique, setShowTechnique] = useState(null);
    const flatListRef = useRef(null);

    useEffect(() => {
        if (visible && messages.length === 0) {
            // Welcome message when opening
            const welcomeMessage = {
                id: '1',
                text: `Hi ${userName || 'there'}! I'm Serine, your personal CBT assistant. I'm here to help you process your thoughts and feelings. What's on your mind today?`,
                sender: 'serine',
                timestamp: new Date().toISOString(),
                technique: null
            };
            setMessages([welcomeMessage]);
        }
    }, [visible, userName]);

    const sendMessage = async () => {
        if (!inputText.trim() || loading) return;

        const userMessage = {
            id: Date.now().toString(),
            text: inputText.trim(),
            sender: 'user',
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setLoading(true);

        try {
            // Try Phi-2 first, fallback to demo service
            let cbtResponse;
            const phi2Status = enhancedLLMService.getStatus();

            if (phi2Status.initialized) {
                console.log('🧠 Using Phi-2 for CBT response...');
                cbtResponse = await enhancedLLMService.getCBTHelp(inputText.trim());
            } else {
                console.log('🎯 Using demo service for CBT response...');
                cbtResponse = await demoLLMService.getCBTHelp(inputText.trim());
            }

            const serineMessage = {
                id: (Date.now() + 1).toString(),
                text: cbtResponse.response,
                sender: 'serine',
                timestamp: new Date().toISOString(),
                technique: cbtResponse.technique,
                isEnhanced: cbtResponse.isEnhanced
            };

            setMessages(prev => [...prev, serineMessage]);

            // Auto-scroll to bottom
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);

        } catch (error) {
            console.error('CBT response error:', error);
            Alert.alert('Error', 'Serine is having trouble responding. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderMessage = ({ item }) => {
        const isUser = item.sender === 'user';

        return (
            <View style={[
                styles.messageContainer,
                isUser ? styles.userMessage : styles.serineMessage
            ]}>
                <View style={[
                    styles.messageBubble,
                    isUser ? styles.userBubble : styles.serineBubble
                ]}>
                    <Text style={[
                        styles.messageText,
                        isUser ? styles.userText : styles.serineText
                    ]}>
                        {item.text}
                    </Text>

                    {/* Show technique button for Serine messages */}
                    {!isUser && item.technique && (
                        <TouchableOpacity
                            style={styles.techniqueButton}
                            onPress={() => setShowTechnique(item)}
                        >
                            <Text style={styles.techniqueButtonText}>💡 CBT Tip</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <Text style={[
                    styles.timestamp,
                    isUser ? styles.userTimestamp : styles.serineTimestamp
                ]}>
                    {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </Text>
            </View>
        );
    };

    const clearConversation = () => {
        Alert.alert(
            'Clear Conversation',
            'Are you sure you want to clear this conversation with Serine?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: () => setMessages([])
                }
            ]
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>← Back</Text>
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Serine CBT Assistant</Text>
                        <Text style={styles.headerSubtitle}>Your personal therapy companion</Text>
                    </View>

                    <TouchableOpacity onPress={clearConversation} style={styles.clearButton}>
                        <Text style={styles.clearButtonText}>Clear</Text>
                    </TouchableOpacity>
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
                            placeholder="Share what's on your mind..."
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

                {/* CBT Technique Modal */}
                <Modal
                    visible={!!showTechnique}
                    transparent
                    animationType="fade"
                >
                    <View style={styles.techniqueOverlay}>
                        <View style={styles.techniqueModal}>
                            <Text style={styles.techniqueTitle}>💡 CBT Technique</Text>
                            <Text style={styles.techniqueText}>
                                {showTechnique?.technique}
                            </Text>
                            <TouchableOpacity
                                style={styles.techniqueCloseButton}
                                onPress={() => setShowTechnique(null)}
                            >
                                <Text style={styles.techniqueCloseText}>Got it</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingTop: 50,
        backgroundColor: '#1E1E1E',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    closeButton: {
        padding: 8,
    },
    closeButtonText: {
        color: '#9C27B0',
        fontSize: 16,
        fontWeight: '600',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: '#888',
        fontSize: 12,
        marginTop: 2,
    },
    clearButton: {
        padding: 8,
    },
    clearButtonText: {
        color: '#FF4444',
        fontSize: 14,
        fontWeight: '500',
    },
    messagesList: {
        flex: 1,
        paddingHorizontal: 16,
    },
    messageContainer: {
        marginVertical: 4,
        maxWidth: '85%',
    },
    userMessage: {
        alignSelf: 'flex-end',
        alignItems: 'flex-end',
    },
    serineMessage: {
        alignSelf: 'flex-start',
        alignItems: 'flex-start',
    },
    messageBubble: {
        padding: 12,
        borderRadius: 18,
        marginBottom: 2,
    },
    userBubble: {
        backgroundColor: '#9C27B0',
        borderBottomRightRadius: 6,
    },
    serineBubble: {
        backgroundColor: '#2AB67B',
        borderBottomLeftRadius: 6,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 20,
        fontWeight: '500',
    },
    userText: {
        color: '#fff',
    },
    serineText: {
        color: '#fff',
    },
    techniqueButton: {
        marginTop: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    techniqueButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    timestamp: {
        fontSize: 11,
        color: '#666',
        marginTop: 2,
    },
    userTimestamp: {
        textAlign: 'right',
    },
    serineTimestamp: {
        textAlign: 'left',
    },
    inputContainer: {
        backgroundColor: '#1E1E1E',
        borderTopWidth: 1,
        borderTopColor: '#333',
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 16,
    },
    textInput: {
        flex: 1,
        backgroundColor: '#333',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#fff',
        maxHeight: 120,
        marginRight: 12,
    },
    sendButton: {
        backgroundColor: '#2AB67B',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    disabledButton: {
        backgroundColor: '#666',
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    techniqueOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    techniqueModal: {
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        padding: 24,
        width: '90%',
        maxWidth: 350,
    },
    techniqueTitle: {
        color: '#2AB67B',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    techniqueText: {
        color: '#E8E8E8',
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 20,
    },
    techniqueCloseButton: {
        backgroundColor: '#2AB67B',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
    },
    techniqueCloseText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
