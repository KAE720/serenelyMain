// MessagesScreen.js
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Image,
} from "react-native";

export default function MessagesScreen({ onNavigateToChat, currentUser }) {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(""); // For searching conversations

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
            // New 4-emotion color scale
            angry: "#FF4D4F",      // 🔴 Red - Anger/Frustration
            stressed: "#FF8C00",   // 🟠 Orange - Stress/Anxiety
            neutral: "#4CAF50",    // 🟢 Green - Calm/Content
            excited: "#40C4FF",    // 🔵 Blue - Joy/Love/Excitement

            // Legacy mappings
            positive: "#4CAF50",   // -> neutral (green)
            negative: "#FF4D4F",   // -> angry (red)
            supportive: "#40C4FF", // -> excited (blue)
            sad: "#FF8C00",        // -> stressed (orange)
        };
        return toneColors[tone] || "#4CAF50";
    };

    const openChat = (conversation) => {
        const chatPartner = {
            id: conversation.partnerId,
            name: conversation.partnerName,
            avatar: conversation.partnerAvatar,
        };

        onNavigateToChat(chatPartner);
    };

    // Filter conversations based on search query
    const filteredConversations = conversations.filter(conversation => {
        if (!searchQuery.trim()) return true;

        const query = searchQuery.toLowerCase();
        const partnerName = conversation.partnerName.toLowerCase();
        const lastMessage = conversation.lastMessage.toLowerCase();

        return partnerName.includes(query) || lastMessage.includes(query);
    });

    // Highlight search terms in text
    const highlightSearchTerms = (text, searchQuery) => {
        if (!searchQuery.trim()) return text;

        const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, index) => {
            if (regex.test(part)) {
                return (
                    <Text key={index} style={styles.highlightedText}>
                        {part}
                    </Text>
                );
            }
            return part;
        });
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
                        <Text style={styles.partnerName}>
                            {searchQuery.trim() ? highlightSearchTerms(item.partnerName, searchQuery) : item.partnerName}
                        </Text>
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
                            {searchQuery.trim() ? highlightSearchTerms(item.lastMessage, searchQuery) : item.lastMessage}
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
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search conversations..."
                    placeholderTextColor="#666"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity
                        style={styles.clearSearchButton}
                        onPress={() => setSearchQuery("")}
                    >
                        <Text style={styles.clearSearchText}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Search Results Indicator */}
            {searchQuery.length > 0 && (
                <View style={styles.searchResultsContainer}>
                    <Text style={styles.searchResultsText}>
                        {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''} found
                    </Text>
                </View>
            )}

            {loading ? (
                <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 50 }} />
            ) : filteredConversations.length === 0 && searchQuery.length > 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No conversations found</Text>
                    <Text style={styles.emptySubText}>
                        Try searching with different keywords.
                    </Text>
                </View>
            ) : conversations.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No conversations yet 💬</Text>
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
                    data={filteredConversations}
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
        fontFamily: 'SF Pro Text',
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
        fontFamily: 'SF Pro Text',
    },
    timestamp: {
        fontSize: 12,
        color: "#666",
        fontFamily: 'SF Pro Text',
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
        fontFamily: 'SF Pro Text',
    },
    unreadMessage: {
        color: "#fff",
        fontWeight: "500",
        fontFamily: 'SF Pro Text',
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
        fontFamily: 'SF Pro Text',
    },
    emptySubText: {
        fontSize: 14,
        color: "#aaa",
        textAlign: "center",
        marginBottom: 30,
        fontFamily: 'SF Pro Text',
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
