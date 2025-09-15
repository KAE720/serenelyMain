// HomeScreen.js
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Button,
    TouchableOpacity,
    Image,
} from "react-native";
import ProfileScreen from './ProfileScreen';

export default function HomeScreen({ userId, onLogout, user }) {
    const [chatLogs, setChatLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showProfile, setShowProfile] = useState(false);

    // Simulated fetch (replace with backend later)
    useEffect(() => {
        setTimeout(() => {
            setChatLogs([]); // placeholder: no logs yet
            setLoading(false);
        }, 1000);
    }, []);

    // If showing profile, render ProfileScreen
    if (showProfile) {
        return (
            <ProfileScreen 
                user={user} 
                onBack={() => setShowProfile(false)}
                onLogout={onLogout}
            />
        );
    }
        setTimeout(() => {
            setChatLogs([]); // placeholder: no logs yet
            setLoading(false);
        }, 1000);
    }, []);

    // If showing profile, render ProfileScreen
    if (showProfile) {
        return (
            <ProfileScreen 
                user={user} 
                onBack={() => setShowProfile(false)}
                onLogout={onLogout}
            />
        );
    }

    return (
        <View style={styles.container}>
            {/* 🔵 Top Tab */}
            <View style={styles.topBar}>
                <Text style={styles.topBarText}>Messages</Text>

                {/* Profile icon */}
                <TouchableOpacity
                    style={styles.profileIconContainer}
                    onPress={() => setShowProfile(true)}
                >
                    <Image
                        source={
                            user?.photoURL
                                ? { uri: user.photoURL }
                                : require('./assets/default-profile.png')
                        }
                        style={styles.profileIcon}
                    />
                </TouchableOpacity>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    topBarText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
    profileIconContainer: {
        padding: 4,
    },
    profileIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#333',
    },
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
