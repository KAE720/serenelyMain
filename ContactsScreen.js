// ContactsScreen.js (Modified)
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Alert,
    Image
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { db, doc, collection, query, where, getDocs, addDoc, onSnapshot, getAuth, getDoc, setDoc } from "./firebase";
import { ContactsIcon, MessageIcon, ChatBubbleIcon } from "./components/TabIcons";

export default function ContactsScreen({ navigation, onSelectContact }) {
    const [serenId, setSerenId] = useState('');
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const auth = getAuth();
    const currentUser = auth.currentUser;

    // Real-time listener for the contacts list
    useEffect(() => {
        if (!currentUser?.uid) return;
        const q = query(collection(db, "contacts"), where("ownerUid", "==", currentUser.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Deduplicate contacts by contactUid
            const uniqueContacts = [];
            const seenUids = new Set();
            for (const contact of fetched) {
                if (!seenUids.has(contact.contactUid)) {
                    uniqueContacts.push(contact);
                    seenUids.add(contact.contactUid);
                }
            }
            setContacts(uniqueContacts);
        });
        return unsubscribe;
    }, [currentUser?.uid]);

    const addContact = async () => {
        if (!serenId.trim() || !currentUser) {
            Alert.alert("Error", "Please enter a valid SerenID.");
            return;
        }
        if (serenId.trim() === currentUser.uid) {
            Alert.alert("Error", "You cannot add yourself.");
            return;
        }

        setLoading(true);

        try {
            // Check if contact already exists
            const contactsRef = collection(db, "contacts");
            const existingQ = query(contactsRef, where("ownerUid", "==", currentUser.uid), where("contactUid", "==", serenId.trim()));
            const existingSnap = await getDocs(existingQ);
            if (!existingSnap.empty) {
                setLoading(false);
                return;
            }

            // Find the user by their SerenID (which is their UID)
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("uid", "==", serenId.trim()));
            const userSnap = await getDocs(q);

            if (userSnap.empty) {
                // Show dropdown/toast for not found (use Alert for now)
                Alert.alert("No contact found", "Check the SerenID and try again.");
                setLoading(false);
                return;
            }

            const targetUserDoc = userSnap.docs[0];
            const targetUserUID = targetUserDoc.id;

            // Add the contact to the 'contacts' collection
            await addDoc(contactsRef, {
                ownerUid: currentUser.uid,
                contactUid: targetUserUID,
                contactName: targetUserDoc.data().profileName,
                createdAt: new Date(),
            });

            setSerenId('');
            // No success alert
        } catch (error) {
            Alert.alert("Error", "Failed to add contact.");
            console.error("Error adding contact:", error);
        } finally {
            setLoading(false);
        }
    };

    const startChat = async (contact) => {
        try {
            const conversationId = [currentUser.uid, contact.contactUid].sort().join('_');
            const conversationsRef = doc(db, "conversations", conversationId);
            const conversationSnap = await getDoc(conversationsRef);
            if (!conversationSnap.exists()) {
                await setDoc(conversationsRef, {
                    participants: [currentUser.uid, contact.contactUid],
                    createdAt: new Date(),
                    lastMessage: null
                });
            }
            const chatPartner = {
                id: contact.contactUid,
                name: contact.contactName
            };
            if (onSelectContact) {
                onSelectContact(chatPartner, conversationId);
            } else if (navigation) {
                navigation.navigate("Chat", {
                    conversationId: conversationId,
                    chatPartner: chatPartner
                });
            }
        } catch (error) {
            Alert.alert("Error", "Failed to open chat. Please check your permissions and Firestore rules.");
            console.error("Error opening chat:", error);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
            <View style={styles.container}>
                <Text style={styles.title}>Your SerenID: {currentUser?.uid}</Text>
                <View style={styles.addSection}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter SerenID..."
                        placeholderTextColor="#666"
                        value={serenId}
                        onChangeText={setSerenId}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={addContact} disabled={loading}>
                        <Text style={styles.addButtonText}>{loading ? "Adding..." : "Add Friend"}</Text>
                    </TouchableOpacity>
                </View>

                {contacts.length === 0 ? (
                    <View style={styles.emptyState}>
                        <ContactsIcon active={false} size={48} style={styles.emptyIconContainer} />
                        <Text style={styles.emptyText}>No contacts yet</Text>
                        <Text style={styles.emptySubText}>
                            Add friends using their SerenID.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={contacts}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.contactItem}>
                                <View style={styles.profileRow}>
                                    <Image
                                        source={item.profilePicUrl ? { uri: item.profilePicUrl } : require('./assets/default-profile.png')}
                                        style={styles.profilePic}
                                    />
                                    <Text style={styles.contactName}>{item.contactName}</Text>
                                </View>
                                <TouchableOpacity style={styles.chatButton} onPress={() => startChat(item)}>
                                    <ChatBubbleIcon active={true} size={32} />
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#0A0A0A' },
    container: { flex: 1, padding: 20, backgroundColor: '#0A0A0A' },
    title: { fontSize: 16, fontWeight: "bold", color: "#fff", marginBottom: 20, fontFamily: 'SF Pro Text' },
    addSection: { flexDirection: 'row', marginBottom: 20 },
    input: { flex: 1, backgroundColor: '#1E1E1E', color: '#fff', padding: 12, borderRadius: 8, marginRight: 10 },
    addButton: { backgroundColor: '#9C27B0', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, justifyContent: 'center' },
    addButtonText: { color: '#fff', fontWeight: '600', fontFamily: 'SF Pro Text' },
    emptyState: { flex: 1, justifyContent: "center", alignItems: "center" },
    emptyIconContainer: { marginBottom: 16, opacity: 0.6 },
    emptyText: { fontSize: 18, fontWeight: "600", color: "#fff", marginBottom: 8, fontFamily: 'SF Pro Text' },
    emptySubText: { fontSize: 14, color: "#aaa", textAlign: 'center' },
    contactItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    profilePic: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#333',
        marginRight: 8,
    },
    contactName: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 4 },
    chatButton: {
        backgroundColor: 'transparent',
        paddingHorizontal: 4,
        paddingVertical: 4,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chatButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    }
});
