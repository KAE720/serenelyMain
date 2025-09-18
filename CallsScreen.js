// CallsScreen.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CallsIcon } from "./components/TabIcons";

export default function CallsScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                    <CallsIcon active={false} size={48} />
                </View>
                <Text style={styles.emptyText}>No call history yet</Text>
                <Text style={styles.emptySubText}>
                    Make a call to see it here.
                </Text>
            </View>
        </View>
    );
}






const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    emptyState: { flex: 1, justifyContent: "center", alignItems: "center" },
    emptyIconContainer: {
        marginBottom: 16,
        opacity: 0.6,
    },
    emptyText: { fontSize: 18, fontWeight: "600", color: "#fff", marginBottom: 8, fontFamily: 'SF Pro Text' },
    emptySubText: { fontSize: 14, color: "#aaa", textAlign: 'center' },
});
