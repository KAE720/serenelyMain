// CallsScreen.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function CallsScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No call history yet 📞</Text>
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
    emptyText: { fontSize: 18, fontWeight: "600", color: "#fff", marginBottom: 8 },
    emptySubText: { fontSize: 14, color: "#aaa" },
});
