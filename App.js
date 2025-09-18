// App.js
import React, { useEffect, useState } from "react";
import { View, Text, Alert, Image, TouchableOpacity, StyleSheet } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { auth, GoogleAuthProvider, signInWithCredential } from "./firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import HomeScreen from "./HomeScreen";
import AuthScreen from "./AuthScreen";


WebBrowser.maybeCompleteAuthSession();

const googleLogo = { uri: "https://img.icons8.com/color/48/000000/google-logo.png" };

// ENTRY POINT OF THE APP
export default function App() {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setUserId(user.uid);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setUserId(null);
        setIsLoggedIn(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);



  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        setUserId(null);
        setIsLoggedIn(false);
      })
      .catch((error) => Alert.alert("Error", error.message));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // 🔹 If logged in → show HomeScreen
  if (isLoggedIn && user) {
    return (
      <HomeScreen
        userId={userId}
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  // 🔹 If NOT logged in → show AuthScreen
  return <AuthScreen />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loadingText: {
    fontSize: 18,
    color: "#fff",
    fontFamily: 'SF Pro Text',
  },
});
