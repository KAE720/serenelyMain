// App.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { auth, onAuthStateChanged } from "./firebase";
import HomeScreen from "./HomeScreen";
import AuthScreen from "./AuthScreen";
import MessagesScreen from "./MessagesScreen";
import ChatScreen from "./ChatScreen";
import ContactsScreen from "./ContactsScreen";
import CallsScreen from "./CallsScreen";
import ProfileScreen from "./ProfileScreen";
import SereneAIScreen from "./SereneAIScreen";


const Stack = createNativeStackNavigator();

// ENTRY POINT OF THE APP
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <>
              <Stack.Screen name="Home" component={HomeScreen} initialParams={{ user }} />
              <Stack.Screen name="Messages" component={MessagesScreen} initialParams={{ currentUser: user }} />
              <Stack.Screen name="Chat" component={ChatScreen} initialParams={{ currentUser: user }} />
              <Stack.Screen name="Contacts" component={ContactsScreen} initialParams={{ currentUser: user }} />
              <Stack.Screen name="Calls" component={CallsScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} initialParams={{ user }} />
              <Stack.Screen name="SereneAI" component={SereneAIScreen} initialParams={{ currentUser: user }} />
            </>
          ) : (
            <Stack.Screen name="Auth" component={AuthScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
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
