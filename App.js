import React, { useState } from 'react';
import { View, Button, Text, Alert, StyleSheet } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { auth, GoogleAuthProvider, signInWithCredential } from './firebase';

GoogleSignin.configure({
  iosClientId: '1005139761525-h5e2i6369ijtv3q4srrqsocvb8vk7fo2.apps.googleusercontent.com',
});

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);

      // Check if device supports Google Play (Note: This is more relevant for Android)
      await GoogleSignin.hasPlayServices();

      // Get the users ID token from Google
      const { idToken } = await GoogleSignin.signIn();

      // Create a Google credential with the token
      const googleCredential = GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      const userCredential = await signInWithCredential(auth, googleCredential);
      setUser(userCredential.user);

      Alert.alert('Success!', `Welcome ${userCredential.user.displayName}`);
    } catch (error) {
      console.log('Google Sign-In Error:', error);
      Alert.alert('Error', 'Google Sign-In failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.log('Sign out error:', error);
    }
  };

  return (
    <View style={styles.container}>
      {user ? (
        <View style={styles.userInfo}>
          <Text style={styles.welcomeText}>Welcome!</Text>
          <Text style={styles.nameText}>{user.displayName}</Text>
          <Text style={styles.emailText}>{user.email}</Text>
          <Button title="Sign Out" onPress={signOut} />
        </View>
      ) : (
        <Button
          title={loading ? "Signing in..." : "Sign in with Google"}
          onPress={signInWithGoogle}
          disabled={loading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  userInfo: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    marginBottom: 10,
  },
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emailText: {
    fontSize: 14,
    color: 'gray',
    marginTop: 5,
    marginBottom: 20,
  },
});
