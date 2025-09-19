// ContactsScreen.js
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Alert,
    Image,
    Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    db,
    doc,
    collection,
    query,
    where,
    getDocs,
    addDoc,
    onSnapshot,
    getAuth,
    getDoc,
    setDoc,
} from "./firebase";
import { ContactsIcon, ChatBubbleIcon, CallsIcon } from "./components/TabIcons";

export default function ContactsScreen({ navigation, onSelectContact }) {
    const [serenId, setSerenId] = useState("");
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const auth = getAuth();
    const currentUser = auth.currentUser;

    // Listen for contacts in real time
    useEffect(() => {
        if (!currentUser?.uid) return;
        const q = query(
            collection(db, "contacts"),
            where("ownerUid", "==", currentUser.uid)
        );
        const unsubscribe = onSnapshot(q, (snap) => {
            const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            // Dedupe by contactUid
            const unique = [];
            const seen = new Set();
            fetched.forEach((c) => {
                if (!seen.has(c.contactUid)) {
                    unique.push(c);
                    seen.add(c.contactUid);
                }
            });
            setContacts(unique);
        });
        return unsubscribe;
    }, [currentUser?.uid]);

    // Add a new contact by SerenID
    const addContact = async () => {
        const id = serenId.trim();
        if (!id || id === currentUser.uid) {
            return Alert.alert("Error", "Enter a valid SerenID (not your own).");
        }
        setLoading(true);
        try {
            // Prevent duplicates
            const contactsRef = collection(db, "contacts");
            const existingQ = query(
                contactsRef,
                where("ownerUid", "==", currentUser.uid),
                where("contactUid", "==", id)
            );
            const existingSnap = await getDocs(existingQ);
            if (!existingSnap.empty) return;

            // Lookup user by UID
            const usersRef = collection(db, "users");
            const userQ = query(usersRef, where("uid", "==", id));
            const userSnap = await getDocs(userQ);
            if (userSnap.empty) {
                return Alert.alert("Not found", "No user with that SerenID.");
            }

            const userDoc = userSnap.docs[0];
            await addDoc(contactsRef, {
                ownerUid: currentUser.uid,
                contactUid: userDoc.id,
                contactName: userDoc.data().profileName,
                createdAt: new Date(),
            });
            setSerenId("");
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Could not add contact.");
        } finally {
            setLoading(false);
        }
    };

    // Start or resume a chat
    const startChat = async (contact) => {
        try {
            const convoId = [currentUser.uid, contact.contactUid]
                .sort()
                .join("_");
            const convoRef = doc(db, "conversations", convoId);
            const convoSnap = await getDoc(convoRef);
            if (!convoSnap.exists()) {
                await setDoc(convoRef, {
                    participants: [currentUser.uid, contact.contactUid],
                    createdAt: new Date(),
                    lastMessage: null,
                });
            }
            const chatPartner = {
                id: contact.contactUid,
                name: contact.contactName,
            };
            if (onSelectContact) {
                onSelectContact(chatPartner, convoId);
            } else {
                navigation.navigate("Chat", { conversationId: convoId, chatPartner });
            }
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Could not open chat.");
        }
    };

    // Initiate a phone call via native dialer
    const initiateCall = async (contact) => {
        try {
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            const contactDoc = await getDoc(
                doc(db, "users", contact.contactUid)
            );
            const myPhone = userDoc.data()?.phoneNumber;
            const theirPhone = contactDoc.data()?.phoneNumber;

            if (!myPhone || !theirPhone) {
                return Alert.alert(
                    "Missing Phone Number",
                    "Both you and your contact need a phone number saved."
                );
            }

            Linking.openURL(`tel:${theirPhone}`);
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Could not start call.");
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
            <View style={styles.container}>
                {/* Your SerenID & add-friend bar */}
                <Text style={styles.title}>
                    Your SerenID: {currentUser?.uid}
                </Text>
                <View style={styles.addSection}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter SerenID..."
                        placeholderTextColor="#666"
                        value={serenId}
                        onChangeText={setSerenId}
                    />
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={addContact}
                        disabled={loading}
                    >
                        <Text style={styles.addButtonText}>
                            {loading ? "Adding..." : "Add Friend"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Empty state */}
                {contacts.length === 0 ? (
                    <View style={styles.emptyState}>
                        <ContactsIcon active={false} size={48} />
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
                                        source={
                                            item.profilePicUrl
                                                ? { uri: item.profilePicUrl }
                                                : require("./assets/default-profile.png")
                                        }
                                        style={styles.profilePic}
                                    />
                                    <Text style={styles.contactName}>
                                        {item.contactName}
                                    </Text>
                                </View>
                                <View style={styles.actions}>
                                    <TouchableOpacity
                                        style={styles.callButton}
                                        onPress={() => initiateCall(item)}
                                    >
                                        <CallsIcon active={true} size={28} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.chatButton}
                                        onPress={() => startChat(item)}
                                    >
                                        <ChatBubbleIcon active={true} size={28} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#0A0A0A" },
    container: { flex: 1, padding: 20, backgroundColor: "#0A0A0A" },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 20,
        fontFamily: "SF Pro Text",
    },
    addSection: { flexDirection: "row", marginBottom: 20 },
    input: {
        flex: 1,
        backgroundColor: "#1E1E1E",
        color: "#fff",
        padding: 12,
        borderRadius: 8,
        marginRight: 10,
    },
    addButton: {
        backgroundColor: "#9C27B0",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        justifyContent: "center",
    },
    addButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontFamily: "SF Pro Text",
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#fff",
        marginTop: 8,
        fontFamily: "SF Pro Text",
    },
    emptySubText: {
        fontSize: 14,
        color: "#aaa",
        marginTop: 4,
        textAlign: "center",
    },
    contactItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#1E1E1E",
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    profileRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    profilePic: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#333",
        marginRight: 8,
    },
    contactName: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    actions: {
        flexDirection: "row",
    },
    callButton: {
        marginRight: 16,
        padding: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    chatButton: {
        padding: 8,
        justifyContent: "center",
        alignItems: "center",
    },
});
