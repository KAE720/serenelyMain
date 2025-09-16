// ContactsScreen.js
import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList
} from "react-native";
import { ContactsIcon } from "./components/TabIcons";

export default function ContactsScreen() {
    const [contacts, setContacts] = useState([]);
    const [serenId, setSerenId] = useState('');

    const addContact = () => {
        if (serenId.trim()) {
            const newContact = {
                id: Date.now().toString(),
                serenId: serenId.trim(),
                name: `User ${serenId.substring(0, 4)}`, // placeholder name
            };
            setContacts([...contacts, newContact]);
            setSerenId('');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add Friend by SerenID</Text>

            <View style={styles.addSection}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter SerenID..."
                    placeholderTextColor="#666"
                    value={serenId}
                    onChangeText={setSerenId}
                />
                <TouchableOpacity style={styles.addButton} onPress={addContact}>
                    <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
            </View>

            {contacts.length === 0 ? (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIconContainer}>
                        <ContactsIcon active={false} size={48} />
                    </View>
                    <Text style={styles.emptyText}>No contacts yet</Text>
                    <Text style={styles.emptySubText}>
                        Add friends using their SerenID or sync with phone contacts.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={contacts}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.contactItem}>
                            <Text style={styles.contactName}>{item.name}</Text>
                            <Text style={styles.contactId}>SerenID: {item.serenId}</Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 20, fontFamily: 'SF Pro Text' },
    addSection: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    input: {
        flex: 1,
        backgroundColor: '#1E1E1E',
        color: '#fff',
        padding: 12,
        borderRadius: 8,
        marginRight: 10,
    },
    addButton: {
        backgroundColor: '#9C27B0',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        justifyContent: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontFamily: 'SF Pro Text',
    },
    emptyState: { flex: 1, justifyContent: "center", alignItems: "center" },
    emptyIconContainer: {
        marginBottom: 16,
        opacity: 0.6,
    },
    emptyText: { fontSize: 18, fontWeight: "600", color: "#fff", marginBottom: 8, fontFamily: 'SF Pro Text' },
    emptySubText: { fontSize: 14, color: "#aaa", textAlign: 'center' },
    contactItem: {
        backgroundColor: '#1E1E1E',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    contactName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
        fontFamily: 'SF Pro Text',
    },
    contactId: {
        color: '#aaa',
        fontSize: 14,
        fontFamily: 'SF Pro Text',
    },
});
