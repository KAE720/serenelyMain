// MessagesScreen.js
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Image,
} from "react-native";

export default function MessagesScreen({ onNavigateToChat, currentUser }) {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock conversations - replace with backend later
    useEffect(() => {
        setTimeout(() => {
            setConversations([
                {
                    id: "1",
                    partnerId: "partner1",
                    partnerName: "Sarah Johnson",
                    partnerAvatar: "https://via.placeholder.com/50",
                    lastMessage: "That sounds great! Looking forward to it 😊",
                    lastMessageTime: new Date(Date.now() - 300000).toISOString(),
                    unreadCount: 2,
                    lastMessageTone: "positive",
                },
                {
                    id: "2",
                    partnerId: "partner2",
                    partnerName: "Mike Chen",
                    partnerAvatar: "https://via.placeholder.com/50",
                    lastMessage: "I understand your point of view",
                    lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
                    unreadCount: 0,
                    lastMessageTone: "supportive",
                },
                {
                    id: "3",
                    partnerId: "partner3",
                    partnerName: "Alex Rivera",
                    partnerAvatar: "https://via.placeholder.com/50",
                    lastMessage: "Can we talk about this later?",
                    lastMessageTime: new Date(Date.now() - 7200000).toISOString(),
                    unreadCount: 1,
                    lastMessageTone: "stressed",
                },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

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

    const openChat = (conversation) => {
        const chatPartner = {
            id: conversation.partnerId,
            name: conversation.partnerName,
            avatar: conversation.partnerAvatar,
        };

        onNavigateToChat(chatPartner);
    };

    const renderConversation = ({ item }) => {
        const toneColor = getToneColor(item.lastMessageTone);
        const timeAgo = getTimeAgo(item.lastMessageTime);

        return (
            <TouchableOpacity
                style={styles.conversationItem}
                onPress={() => openChat(item)}
            >
                <View style={styles.avatarContainer}>
                    <Image
                        source={{ uri: item.partnerAvatar }}
                        style={styles.avatar}
                    />
                    {item.unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>{item.unreadCount}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.conversationContent}>
                    <View style={styles.conversationHeader}>
                        <Text style={styles.partnerName}>{item.partnerName}</Text>
                        <Text style={styles.timestamp}>{timeAgo}</Text>
                    </View>

                    <View style={styles.lastMessageContainer}>
                        <View style={[styles.toneIndicator, { backgroundColor: toneColor }]} />
                        <Text
                            style={[
                                styles.lastMessage,
                                item.unreadCount > 0 && styles.unreadMessage
                            ]}
                            numberOfLines={1}
                        >
                            {item.lastMessage}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const getTimeAgo = (timestamp) => {
        const now = new Date();
        const messageTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));

        if (diffInMinutes < 1) return "now";
        if (diffInMinutes < 60) return `${diffInMinutes}m`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
        return `${Math.floor(diffInMinutes / 1440)}d`;
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 50 }} />
            ) : conversations.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No conversations yet �</Text>
                    <Text style={styles.emptySubText}>
                        Start a conversation with a friend to see it here.
                    </Text>
                    <TouchableOpacity
                        style={styles.startChatButton}
                        onPress={() => navigation.navigate("Contacts")}
                    >
                        <Text style={styles.startChatButtonText}>Find Friends</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={conversations}
                    keyExtractor={(item) => item.id}
                    renderItem={renderConversation}
                    style={styles.conversationsList}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000"
    },
    conversationsList: {
        flex: 1,
    },
    conversationItem: {
        flexDirection: "row",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#333",
        alignItems: "center",
    },
    avatarContainer: {
        position: "relative",
        marginRight: 16,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#333",
    },
    unreadBadge: {
        position: "absolute",
        top: -5,
        right: -5,
        backgroundColor: "#4A90E2",
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    unreadText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
    },
    conversationContent: {
        flex: 1,
    },
    conversationHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    partnerName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    timestamp: {
        fontSize: 12,
        color: "#666",
    },
    lastMessageContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    toneIndicator: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 8,
    },
    lastMessage: {
        fontSize: 14,
        color: "#aaa",
        flex: 1,
    },
    unreadMessage: {
        color: "#fff",
        fontWeight: "500",
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#fff",
        marginBottom: 8,
        textAlign: "center",
    },
    emptySubText: {
        fontSize: 14,
        color: "#aaa",
        textAlign: "center",
        marginBottom: 30,
    },
    startChatButton: {
        backgroundColor: "#4A90E2",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 20,
    },
    startChatButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
