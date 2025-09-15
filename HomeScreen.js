// HomeScreen.js
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Button,
} from "react-native";

export default function HomeScreen({ userId, onLogout }) {
    const [chatLogs, setChatLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Simulated fetch (replace with backend later)
    useEffect(() => {
        setTimeout(() => {
            setChatLogs([]); // placeholder: no logs yet
            setLoading(false);
        }, 1000);
    }, []);

    return (
        <View style={styles.container}>
            {/* 🔵 Top Tab */}
            <View style={styles.topBar}>
                <Text style={styles.topBarText}>Chat Logs</Text>
            </View>

            {/* Main content */}
            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
                ) : chatLogs.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No chat logs yet 📝</Text>
                        <Text style={styles.emptySubText}>
                            Start a conversation to see it here.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={chatLogs}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.chatItem}>
                                <Text style={styles.chatText}>{item.message}</Text>
                            </View>
                        )}
                    />
                )}
            </View>

            {/* 🚪 Logout button */}
            <View style={styles.logoutButton}>
                <Button title="Logout" onPress={onLogout} color="red" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#121212" },
    topBar: {
        backgroundColor: "#1976D2",
        paddingTop: 50, // offset for notch / status bar
        paddingBottom: 15,
        alignItems: "center",
    },
    topBarText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
    content: { flex: 1, padding: 20 },
    emptyState: { flex: 1, justifyContent: "center", alignItems: "center" },
    emptyText: { fontSize: 18, fontWeight: "600", color: "#fff", marginBottom: 8 },
    emptySubText: { fontSize: 14, color: "#aaa" },
    chatItem: {
        padding: 15,
        marginVertical: 5,
        backgroundColor: "#1E1E1E",
        borderRadius: 8,
    },
    chatText: { fontSize: 16, color: "#fff" },
    logoutButton: {
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: "#333",
        backgroundColor: "#1a1a1a",
    },
});
