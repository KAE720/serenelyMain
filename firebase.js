// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDqYLl3pGyeSHw3y2C9oWqgrERxXt_ZfGo",
  authDomain: "serenely-11.firebaseapp.com",
  projectId: "serenely-11",
  storageBucket: "serenely-11.firebasestorage.app",
  messagingSenderId: "635219552771",
  appId: "1:635219552771:web:804159b24edbde1016bc36",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, GoogleAuthProvider, signInWithCredential };
