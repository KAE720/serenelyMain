// AuthScreen.js
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import {
    auth,
    GoogleAuthProvider,
    signInWithCredential,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from "./firebase";

WebBrowser.maybeCompleteAuthSession();

const googleLogo = { uri: "https://img.icons8.com/color/48/000000/google-logo.png" };

export default function AuthScreen() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);

    // Google Auth Setup
    const [request, response, promptAsync] = Google.useAuthRequest({
        expoClientId: "635219552771-lirlguu5a8gmjl2m238lvvaukl6ka500.apps.googleusercontent.com",
        iosClientId: "635219552771-dsn2oj9hi2vhr8oepkulgk7lq5gin27p.apps.googleusercontent.com",
    });

    React.useEffect(() => {
        if (response?.type === "success") {
            const { id_token } = response.params;
            const credential = GoogleAuthProvider.credential(id_token);
            signInWithCredential(auth, credential)
                .then(() => {
                    // Clear form fields after successful Google sign-in
                    setEmail("");
                    setPassword("");
                    setConfirmPassword("");
                    setFullName("");
                })
                .catch((err) => Alert.alert("Error", err.message));
        }
    }, [response]);

    const handleEmailAuth = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (isSignUp && password !== confirmPassword) {
            Alert.alert("Error", "Passwords don't match");
            return;
        }

        if (isSignUp && !fullName.trim()) {
            Alert.alert("Error", "Please enter your full name");
            return;
        }

        setLoading(true);

        try {
            if (isSignUp) {
                // Create new account
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                // Update the user's display name
                await updateProfile(userCredential.user, {
                    displayName: fullName.trim()
                });
                Alert.alert("Success", "Account created successfully!");

                // Clear form fields after successful sign-up
                setEmail("");
                setPassword("");
                setConfirmPassword("");
                setFullName("");
            } else {
                // Sign in existing user
                await signInWithEmailAndPassword(auth, email, password);

                // Clear form fields after successful sign-in
                setEmail("");
                setPassword("");
                setConfirmPassword("");
                setFullName("");
            }
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        promptAsync();
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.headerContainer}>
                    <Text style={styles.appTitle}>Serene</Text>
                    <Text style={styles.subtitle}>
                        Better communication for couples & friends 💙
                    </Text>
                </View>

                <View style={styles.authContainer}>
                    <Text style={styles.authTitle}>
                        {isSignUp ? "Create Account" : "Welcome Back"}
                    </Text>

                    {/* Email/Password Form */}
                    <View style={styles.formContainer}>
                        {isSignUp && (
                            <TextInput
                                style={styles.input}
                                placeholder="Full Name"
                                placeholderTextColor="#666"
                                value={fullName}
                                onChangeText={setFullName}
                                autoCapitalize="words"
                            />
                        )}

                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="#666"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#666"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        {isSignUp && (
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm Password"
                                placeholderTextColor="#666"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                            />
                        )}

                        <TouchableOpacity
                            style={[styles.authButton, loading && styles.disabledButton]}
                            onPress={handleEmailAuth}
                            disabled={loading}
                        >
                            <Text style={styles.authButtonText}>
                                {loading ? "Loading..." : (isSignUp ? "Sign Up" : "Sign In")}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Divider */}
                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Google Sign In */}
                    <TouchableOpacity
                        style={styles.googleButton}
                        disabled={!request}
                        onPress={handleGoogleSignIn}
                    >
                        <Image source={googleLogo} style={styles.googleIcon} />
                        <Text style={styles.googleButtonText}>Continue with Google</Text>
                    </TouchableOpacity>

                    {/* Toggle Sign Up/Sign In */}
                    <TouchableOpacity
                        style={styles.toggleContainer}
                        onPress={() => setIsSignUp(!isSignUp)}
                    >
                        <Text style={styles.toggleText}>
                            {isSignUp
                                ? "Already have an account? Sign In"
                                : "Don't have an account? Sign Up"
                            }
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 20,
    },
    headerContainer: {
        alignItems: "center",
        marginBottom: 40,
    },
    appTitle: {
        fontSize: 48,
        fontWeight: "bold",
        color: "#4A90E2",
        marginBottom: 10,
        fontFamily: 'SF Pro Text',
    },
    subtitle: {
        fontSize: 16,
        color: "#aaa",
        textAlign: "center",
        fontFamily: 'SF Pro Text',
    },
    authContainer: {
        backgroundColor: "#1E1E1E",
        borderRadius: 20,
        padding: 30,
        marginHorizontal: 10,
    },
    authTitle: {
        fontSize: 24,
        fontWeight: "600",
        color: "#fff",
        textAlign: "center",
        marginBottom: 30,
        fontFamily: 'SF Pro Text',
    },
    formContainer: {
        marginBottom: 20,
    },
    input: {
        backgroundColor: "#333",
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        color: "#fff",
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#444",
    },
    authButton: {
        backgroundColor: "#4A90E2",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        marginTop: 10,
    },
    disabledButton: {
        backgroundColor: "#666",
    },
    authButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
        fontFamily: 'SF Pro Text',
    },
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#444",
    },
    dividerText: {
        color: "#666",
        marginHorizontal: 15,
    },
    googleButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    googleIcon: {
        width: 24,
        height: 24,
        marginRight: 12,
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
        fontFamily: 'SF Pro Text',
    },
    toggleContainer: {
        alignItems: "center",
        paddingTop: 10,
    },
    toggleText: {
        color: "#4A90E2",
        fontSize: 14,
        fontFamily: 'SF Pro Text',
    },
});
