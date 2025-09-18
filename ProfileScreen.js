// ProfileScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert, ScrollView } from 'react-native';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from './firebase';

export default function ProfileScreen({ user, onBack, onLogout, onOpenModelManagement, onOpenLLMTest }) {
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);


    const isGoogleUser = user?.providerData?.some(provider => provider.providerId === 'google.com');

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
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

            {/* User email */}
            <Text style={styles.emailText}>{user?.email}</Text>

            {/* Password change section - only for email users */}
            {!isGoogleUser && (
                <View style={styles.passwordSection}>
                    {!showPasswordChange ? (
                        <TouchableOpacity
                            style={styles.changePasswordButton}
                            onPress={() => setShowPasswordChange(true)}
                        >
                            <Text style={styles.changePasswordText}>Change Password</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.passwordForm}>
                            <Text style={styles.passwordFormTitle}>Change Password</Text>

                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Current Password"
                                placeholderTextColor="#666"
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                secureTextEntry
                            />

                            <TextInput
                                style={styles.passwordInput}
                                placeholder="New Password"
                                placeholderTextColor="#666"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry
                            />

                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Confirm New Password"
                                placeholderTextColor="#666"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                            />

                            <View style={styles.passwordActions}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => {
                                        setShowPasswordChange(false);
                                        setCurrentPassword('');
                                        setNewPassword('');
                                        setConfirmPassword('');
                                    }}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.updateButton, loading && styles.disabledButton]}
                                    onPress={handlePasswordChange}
                                    disabled={loading}
                                >
                                    <Text style={styles.updateButtonText}>
                                        {loading ? 'Updating...' : 'Update'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            )}

       

            {/* Logout button */}
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
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
    passwordSection: {
        width: '100%',
        marginBottom: 30,
    },
    changePasswordButton: {
        backgroundColor: '#4A90A4',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        alignItems: 'center',
    },
    changePasswordText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'SF Pro Text',
    },
    passwordForm: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 20,
        width: '100%',
    },
    passwordFormTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 20,
        textAlign: 'center',
        fontFamily: 'SF Pro Text',
    },
    passwordInput: {
        backgroundColor: '#333',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        color: '#fff',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#444',
        fontFamily: 'SF Pro Text',
    },
    passwordActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    cancelButton: {
        backgroundColor: '#666',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 0.45,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'SF Pro Text',
    },
    updateButton: {
        backgroundColor: '#4A90A4',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 0.45,
        alignItems: 'center',
    },
    updateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'SF Pro Text',
    },
    disabledButton: {
        backgroundColor: '#666',
    },
    modelManagementButton: {
        backgroundColor: '#4A90A4',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginTop: 20,
        alignItems: 'center',
    },
    modelManagementText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'SF Pro Text',
    },
    testButton: {
        backgroundColor: '#28a745',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center',
    },
    testButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
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
