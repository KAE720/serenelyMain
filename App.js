import React, { useEffect, useState } from 'react';
import { View, Button, Text, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { auth, GoogleAuthProvider, signInWithCredential } from './firebase';

// Required for iOS AuthSession
WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [user, setUser] = useState(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: '635219552771-lirlguu5a8gmjl2m238lvvaukl6ka500.apps.googleusercontent.com',
    iosClientId: "635219552771-dsn2oj9hi2vhr8oepkulgk7lq5gin27p.apps.googleusercontent.com"
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(u => setUser(u.user))
        .catch(err => Alert.aalert('Error', err.message));
    }
  }, [response]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {user ? (
        <Text>Welcome, {user.displayName}</Text>
      ) : (
        <Button title="Sign in with Google" disabled={!request} onPress={() => promptAsync()} />
      )}
    </View>
  );
}
