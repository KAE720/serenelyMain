// firebase.js
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  initializeAuth,
  getReactNativePersistence
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc // You need to import this to check for existing documents
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDqYLl3pGyeSHw3y2C9oWqgrERxXt_ZfGo",
  authDomain: "serenely-11.firebaseapp.com",
  projectId: "serenely-11",
  storageBucket: "serenely-11.firebasestorage.app",
  messagingSenderId: "635219552771",
  appId: "1:635219552771:web:804159b24edbde1016bc36",
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const db = getFirestore(app);

export {
  auth,
  db,
  GoogleAuthProvider,
  signInWithCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  doc,
  setDoc,
  getDoc // Export getDoc as well
};
