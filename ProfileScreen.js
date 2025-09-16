// ProfileScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

export default function ProfileScreen({ user, onBack, onLogout }) {
    return (
        <View style={styles.container}>
            {/* Back button */}
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            {/* Profile picture */}
            <Image
                source={
                    user?.photoURL
                        ? { uri: user.photoURL }
                        : require('./assets/default-profile.png')
                }
                style={styles.profileImage}
            />

            {/* User name */}
            <Text style={styles.nameText}>{user?.displayName || 'User'}</Text>

            {/* User ID */}
            <Text style={styles.idText}>SerenID: {user?.uid?.substring(0, 8) || 'Unknown'}</Text>

            {/* Logout button */}
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
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
        color: '#1976D2',
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
