import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDQYIBNUdDkjxZI5hD_v2h0cs0qxeKTnDQ",
  authDomain: "serenely11.firebaseapp.com",
  projectId: "serenely11",
  appId: "1:1005139761525:ios:49ea3649bd4dae2b3fdb3c",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, GoogleAuthProvider, signInWithCredential };
