import React, { useEffect, useState } from "react";
import { View, Text, Alert, Image, TouchableOpacity, StyleSheet } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { auth, GoogleAuthProvider, signInWithCredential, signOut } from "./firebase";
import HomeScreen from "./HomeScreen";

WebBrowser.maybeCompleteAuthSession();

const googleLogo = { uri: "https://img.icons8.com/color/48/000000/google-logo.png" };

export default function App() {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: "635219552771-lirlguu5a8gmjl2m238lvvaukl6ka500.apps.googleusercontent.com",
    iosClientId: "635219552771-dsn2oj9hi2vhr8oepkulgk7lq5gin27p.apps.googleusercontent.com",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then((u) => {
          setUser(u.user);
          setUserId(u.user.uid);
          setIsLoggedIn(true);

          // show welcome splash for 2 seconds
          setShowWelcome(true);
          setTimeout(() => setShowWelcome(false), 2000);
        })
        .catch((err) => Alert.alert("Error", err.message));
    }
  }, [response]);

  // 🔹 If logged in & still showing welcome → splash screen
  if (isLoggedIn && showWelcome && user) {
    return (
      <View style={styles.container}>
        <Text style={styles.welcomeText}>Welcome, {user.displayName} 🎉</Text>
      </View>
    );
  }

  // 🔹 If logged in → show home
  if (isLoggedIn && user) {
    return (
      <HomeScreen
        user={user}
        userId={userId}
        onLogout={() => {
          signOut(auth);
          setUser(null);
          setUserId(null);
          setIsLoggedIn(false);
        }}
      />
    );
  }

  // 🔹 Otherwise → show login screen
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.googleButton}
        disabled={!request}
        onPress={() => promptAsync()}
      >
        <Image source={googleLogo} style={styles.googleLogo} />
        <Text style={styles.googleButtonText}>Sign in with Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  welcomeText: { fontSize: 24, fontWeight: "bold" },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleLogo: { width: 24, height: 24, marginRight: 10 },
  googleButtonText: { fontSize: 18, color: "#000" },
});
