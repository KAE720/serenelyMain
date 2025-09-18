import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    TextInput,
} from "react-native";
import {
    db,
    collection,
    query,
    where,
    onSnapshot,
    getAuth,
    doc,
    getDoc,
} from "./firebase";

export default function MessagesScreen({ navigation, onNavigateToChat, currentUser }) {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const auth = getAuth();
    const currentUserUid = auth.currentUser?.uid;

    useEffect(() => {
        if (!currentUserUid) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "conversations"),
            where("participants", "array-contains", currentUserUid)
        );

        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const fetchedConversations = [];
            for (const docSnapshot of querySnapshot.docs) {
                const convoData = docSnapshot.data();
                const partnerId = convoData.participants.find(id => id !== currentUserUid);

                let partnerName = "Unknown User";
                if (partnerId) {
                    const partnerDoc = await getDoc(doc(db, "users", partnerId));
                    partnerName = partnerDoc.exists() ? partnerDoc.data().profileName : "Unknown User";
                }

                const lastMessageText = convoData.lastMessage?.text || "No messages yet.";

                fetchedConversations.push({
                    id: docSnapshot.id,
                    partnerId: partnerId,
                    partnerName: partnerName,
                    lastMessage: lastMessageText,
                });
            }
            setConversations(fetchedConversations);
            setLoading(false);
        }, (error) => {
            console.error("Firebase Snapshot Listener Error:", error);
        });

        return unsubscribe;
    }, [currentUserUid]);

    const openChat = (conversation) => {
        const chatPartner = {
            id: conversation.partnerId,
            name: conversation.partnerName,
        };
        if (onNavigateToChat) {
            onNavigateToChat(chatPartner, conversation.id);
        } else if (navigation) {
            navigation.navigate("Chat", { chatPartner: chatPartner, conversationId: conversation.id });
        }
    };

    const renderConversation = ({ item }) => (
        <TouchableOpacity
            style={styles.conversationItem}
            onPress={() => openChat(item)}
        >
            <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{item.partnerName.charAt(0)}</Text>
            </View>
            <View style={styles.conversationContent}>
                <Text style={styles.partnerName}>{item.partnerName}</Text>
                <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
            </View>
        </TouchableOpacity>
    );

    const filteredConversations = conversations.filter(convo => {
        const query = searchQuery.toLowerCase();
        return convo.partnerName.toLowerCase().includes(query) || convo.lastMessage.toLowerCase().includes(query);
    });

    if (loading) {
        return <ActivityIndicator size="large" color="#4A90E2" style={styles.loading} />;
    }

    if (conversations.length === 0) {
        return (
            <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No conversations yet 💬</Text>
                <Text style={styles.emptySubText}>
                    Find friends to start a chat.
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search conversations..."
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
            <FlatList
                data={filteredConversations}
                keyExtractor={(item) => item.id}
                renderItem={renderConversation}
                style={styles.conversationsList}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    loading: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
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
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#555",
        marginRight: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarInitial: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "bold",
    },
    conversationContent: {
        flex: 1,
    },
    partnerName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    lastMessage: {
        fontSize: 14,
        color: "#aaa",
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
    },
    searchContainer: {
        backgroundColor: "#1E1E1E",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#333",
    },
    searchInput: {
        backgroundColor: "#333",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 14,
        color: "#fff",
    },
});
