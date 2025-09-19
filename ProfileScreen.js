// ProfileScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { auth, signOut } from './firebase';

export default function ProfileScreen({ route, navigation }) {
    // Get user from navigation params or fallback to auth.currentUser
    const user = route?.params?.user || auth.currentUser;
    const displayName = user?.displayName || user?.email || 'Unknown User';
    const profilePic = user?.photoURL ? { uri: user.photoURL } : require('./assets/default-profile.png');
    const serenId = user?.uid || 'Unknown';
    const email = user?.email || 'No email';

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
        } catch (error) {
            Alert.alert('Logout Error', error.message);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            {/* Back button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            {/* Profile picture */}
            <Image source={profilePic} style={styles.profileImage} />

            {/* Display name */}
            <Text style={styles.nameText}>{displayName}</Text>

            {/* Full SerenID */}
            <Text style={styles.idText}>SerenID: {serenId}</Text>

            {/* Email */}
            <Text style={styles.emailText}>{email}</Text>

            {/* Logout button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    scrollContent: {
        alignItems: 'center',
        paddingTop: 50,
        padding: 20,
    },
    backButton: {
        alignSelf: 'flex-start',
        marginBottom: 30,
        padding: 10,
    },
    backText: {
        color: '#7B2CBF',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'SF Pro Text',
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 20,
        backgroundColor: '#333',
    },
    nameText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        fontFamily: 'SF Pro Text',
    },
    idText: {
        color: '#aaa',
        fontSize: 16,
        marginBottom: 10,
        fontFamily: 'SF Pro Text',
    },
    emailText: {
        color: '#aaa',
        fontSize: 14,
        marginBottom: 30,
        fontFamily: 'SF Pro Text',
    },
    logoutButton: {
        backgroundColor: '#dc3545',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginTop: 10,
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'SF Pro Text',
    },
});
