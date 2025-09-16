// AuthScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Animated,
    Easing,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import {
    auth,
    GoogleAuthProvider,
    signInWithCredential,
} from "./firebase";

WebBrowser.maybeCompleteAuthSession();

const googleLogo = { uri: "https://img.icons8.com/color/48/000000/google-logo.png" };

export default function AuthScreen() {
    const [loading, setLoading] = useState(false);

    // Animation values
    const logoScale = useRef(new Animated.Value(0)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const textTranslateY = useRef(new Animated.Value(50)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const containerOpacity = useRef(new Animated.Value(0)).current;

    // Google Auth Setup
    const [request, response, promptAsync] = Google.useAuthRequest({
        expoClientId: "635219552771-lirlguu5a8gmjl2m238lvvaukl6ka500.apps.googleusercontent.com",
        iosClientId: "635219552771-dsn2oj9hi2vhr8oepkulgk7lq5gin27p.apps.googleusercontent.com",
    });

    // Entrance animations
    useEffect(() => {
        const logoAnimation = Animated.parallel([
            Animated.timing(logoScale, {
                toValue: 1,
                duration: 600,
                easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
                useNativeDriver: true,
            }),
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 500,
                delay: 100,
                useNativeDriver: true,
            }),
        ]);

        const textAnimation = Animated.parallel([
            Animated.timing(textTranslateY, {
                toValue: 0,
                duration: 600,
                delay: 300,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(textOpacity, {
                toValue: 1,
                duration: 400,
                delay: 300,
                useNativeDriver: true,
            }),
        ]);

        const containerAnimation = Animated.timing(containerOpacity, {
            toValue: 1,
            duration: 500,
            delay: 600,
            useNativeDriver: true,
        });

        // Start animations in sequence
        Animated.sequence([
            logoAnimation,
            Animated.parallel([textAnimation, containerAnimation]),
        ]).start();
    }, []);

    React.useEffect(() => {
        if (response?.type === "success") {
            setLoading(true);
            const { id_token } = response.params;
            const credential = GoogleAuthProvider.credential(id_token);
            signInWithCredential(auth, credential)
                .then(() => {
                    setLoading(false);
                })
                .catch((err) => {
                    setLoading(false);
                    Alert.alert("Error", err.message);
                });
        }
    }, [response]);

    const handleGoogleSignIn = () => {
        promptAsync();
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Logo and Branding */}
                <View style={styles.headerContainer}>
                    <Animated.Image
                        source={require('./assets/logo1.png')}
                        style={[
                            styles.logo,
                            {
                                opacity: logoOpacity,
                                transform: [{ scale: logoScale }]
                            }
                        ]}
                        resizeMode="contain"
                    />
                    <Animated.View
                        style={[
                            styles.brandNameContainer,
                            {
                                opacity: textOpacity,
                                transform: [{ translateY: textTranslateY }]
                            }
                        ]}
                    >
                        {/* Main text with purple styling */}
                        <Text style={styles.brandNameMain}>Serenely</Text>
                    </Animated.View>
                    <Animated.Text
                        style={[
                            styles.tagline,
                            {
                                opacity: textOpacity,
                                transform: [{ translateY: textTranslateY }]
                            }
                        ]}
                    >
                        Your words, understood.
                    </Animated.Text>
                </View>

                {/* Authentication Container */}
                <Animated.View
                    style={[
                        styles.authContainer,
                        {
                            opacity: containerOpacity,
                        }
                    ]}
                >
                    <Text style={styles.welcomeText}>Welcome</Text>
                    <Text style={styles.subText}>
                        Sign in to start your journey towards better communication
                    </Text>

                    {/* Google Sign In Button */}
                    <TouchableOpacity
                        style={[styles.googleButton, loading && styles.disabledButton]}
                        disabled={!request || loading}
                        onPress={handleGoogleSignIn}
                    >
                        <Image source={googleLogo} style={styles.googleIcon} />
                        <Text style={styles.googleButtonText}>
                            {loading ? "Signing in..." : "Continue with Google"}
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.privacyText}>
                        By continuing, you agree to our terms of service and privacy policy
                    </Text>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0A0A0A", // Deep black for premium feel
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 20,
    },
    headerContainer: {
        alignItems: "center",
        marginBottom: 15, // Reduced further to bring closer
        paddingTop: 5, // Reduced top padding
    },
    logo: {
        width: 300,
        height: 300,
        marginBottom: -8, // Negative margin to bring text even closer
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    brandNameContainer: {
        marginBottom: 6, // Reduced margin to bring closer to logo
        height: 65,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    brandNameMain: {
        fontSize: 54,
        fontWeight: "900",
        fontFamily: 'SF Pro Display',
        letterSpacing: -2,
        textAlign: 'center',
        color: '#C77DFF', // Single bright purple color for better legibility
        textShadowColor: 'rgba(123, 44, 191, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    tagline: {
        fontSize: 16,
        color: "#A888D1", // Updated to match new purple theme
        textAlign: "center",
        fontFamily: 'SF Pro Text',
        lineHeight: 22,
        opacity: 0.9,
    },
    authContainer: {
        backgroundColor: "rgba(30, 30, 30, 0.95)", // Semi-transparent dark
        borderRadius: 24,
        padding: 32,
        marginHorizontal: 8,
        borderWidth: 1,
        borderColor: "rgba(78, 42, 132, 0.15)",
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: "700",
        color: "#E8F4FD",
        textAlign: "center",
        marginBottom: 8,
        fontFamily: 'SF Pro Display',
    },
    subText: {
        fontSize: 15,
        color: "#A888D1",
        textAlign: "center",
        marginBottom: 40,
        fontFamily: 'SF Pro Text',
        lineHeight: 20,
        opacity: 0.85,
    },
    googleButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 18,
        marginBottom: 24,
        shadowColor: '#7B2CBF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 1,
        borderColor: "rgba(78, 42, 132, 0.1)",
    },
    disabledButton: {
        backgroundColor: "#666",
        opacity: 0.7,
    },
    googleIcon: {
        width: 24,
        height: 24,
        marginRight: 12,
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1A1A1A",
        fontFamily: 'SF Pro Text',
    },
    privacyText: {
        fontSize: 12,
        color: "#9A7BB8", // Updated to match new purple theme
        textAlign: "center",
        fontFamily: 'SF Pro Text',
        lineHeight: 16,
        opacity: 0.8,
    },
});
