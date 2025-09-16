// HomeScreen.js
import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
} from "react-native";
import ProfileScreen from './ProfileScreen';
import MessagesScreen from './MessagesScreen';
import CallsScreen from './CallsScreen';
import ContactsScreen from './ContactsScreen';
import AIShrinkScreen from './AIShrinkScreen';
import ChatScreen from './ChatScreen';
import ModelManagementScreen from './ModelManagementScreen';
import TestLLMScreen from './TestLLMScreen';
import { MessageIcon, CallsIcon, ContactsIcon, SereneIcon } from './components/TabIcons';

export default function HomeScreen({ userId, onLogout, user }) {
    const [showProfile, setShowProfile] = useState(false);
    const [showModelManagement, setShowModelManagement] = useState(false);
    const [showLLMTest, setShowLLMTest] = useState(false);
    const [activeTab, setActiveTab] = useState('Messages');
    const [currentScreen, setCurrentScreen] = useState('main'); // 'main' or 'chat'
    const [selectedChat, setSelectedChat] = useState(null);

    // Navigation functions
    const navigateToChat = (chatPartner) => {
        setSelectedChat(chatPartner);
        setCurrentScreen('chat');
    };

    const navigateBack = () => {
        setCurrentScreen('main');
        setSelectedChat(null);
    };

    // If showing profile, render ProfileScreen
    if (showProfile) {
        return (
            <ProfileScreen
                user={user}
                onBack={() => setShowProfile(false)}
                onLogout={onLogout}
                onOpenModelManagement={() => {
                    setShowProfile(false);
                    setShowModelManagement(true);
                }}
                onOpenLLMTest={() => {
                    setShowProfile(false);
                    setShowLLMTest(true);
                }}
            />
        );
    }

    // If showing model management, render ModelManagementScreen
    if (showModelManagement) {
        return (
            <ModelManagementScreen
                onBack={() => setShowModelManagement(false)}
            />
        );
    }

    // If showing LLM test, render TestLLMScreen
    if (showLLMTest) {
        return (
            <TestLLMScreen
                onBack={() => setShowLLMTest(false)}
            />
        );
    }

    // If showing chat, render ChatScreen
    if (currentScreen === 'chat' && selectedChat) {
        return (
            <ChatScreen
                chatPartner={selectedChat}
                currentUser={user}
                onBack={navigateBack}
            />
        );
    }

    // Render content based on active tab
    const renderTabContent = () => {
        switch (activeTab) {
            case 'Messages':
                return <MessagesScreen onNavigateToChat={navigateToChat} currentUser={user} />;
            case 'Calls':
                return <CallsScreen />;
            case 'Contacts':
                return <ContactsScreen />;
            case 'AI Shrink':
                return <AIShrinkScreen />;
            default:
                return <MessagesScreen onNavigateToChat={navigateToChat} currentUser={user} />;
        }
    };

    return (
        <View style={styles.container}>
            {/* 🔵 Top Tab */}
            <View style={styles.topBar}>
                <Text style={styles.topBarText}>{activeTab}</Text>

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

            {/* Tab Content */}
            <View style={styles.content}>
                {renderTabContent()}
            </View>

            {/* Bottom Tab Navigation */}
            <View style={styles.bottomTabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Messages' && styles.activeTab]}
                    onPress={() => setActiveTab('Messages')}
                >
                    <MessageIcon active={activeTab === 'Messages'} size={24} />
                    <Text style={[styles.tabText, activeTab === 'Messages' && styles.activeTabText]}>
                        Messages
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Calls' && styles.activeTab]}
                    onPress={() => setActiveTab('Calls')}
                >
                    <CallsIcon active={activeTab === 'Calls'} size={24} />
                    <Text style={[styles.tabText, activeTab === 'Calls' && styles.activeTabText]}>
                        Calls
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Contacts' && styles.activeTab]}
                    onPress={() => setActiveTab('Contacts')}
                >
                    <ContactsIcon active={activeTab === 'Contacts'} size={24} />
                    <Text style={[styles.tabText, activeTab === 'Contacts' && styles.activeTabText]}>
                        Contacts
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'AI Shrink' && styles.activeTab]}
                    onPress={() => setActiveTab('AI Shrink')}
                >
                    <SereneIcon active={activeTab === 'AI Shrink'} size={24} />
                    <Text style={[styles.tabText, activeTab === 'AI Shrink' && styles.activeTabText]}>
                        Serene
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#121212" },
    topBar: {
        backgroundColor: "#7B2CBF",
        paddingTop: 50, // offset for notch / status bar
        paddingBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    topBarText: { color: "#fff", fontSize: 20, fontWeight: "bold", fontFamily: 'SF Pro Text' },
    profileIconContainer: {
        padding: 4,
    },
    profileIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#333',
    },
    content: { flex: 1 },
    emptyState: { flex: 1, justifyContent: "center", alignItems: "center" },
    emptyText: { fontSize: 18, fontWeight: "600", color: "#fff", marginBottom: 8, fontFamily: 'SF Pro Text' },
    emptySubText: { fontSize: 14, color: "#aaa" },
    chatItem: {
        padding: 15,
        marginVertical: 5,
        backgroundColor: "#1E1E1E",
        borderRadius: 8,
    },
    chatText: { fontSize: 16, color: "#fff" },
    bottomTabs: {
        flexDirection: 'row',
        backgroundColor: '#1a1a1a',
        borderTopWidth: 1,
        borderTopColor: '#333',
        paddingVertical: 10,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        gap: 4,
    },
    activeTab: {
        backgroundColor: '#333',
        borderRadius: 8,
        marginHorizontal: 4,
    },
    tabText: {
        color: '#aaa',
        fontSize: 12,
        fontWeight: '600',
        fontFamily: 'SF Pro Text',
    },
    activeTabText: {
        color: '#7B2CBF',
    },
});
