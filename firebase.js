import { initializeApp, getApps, getApp } from 'firebase/app';
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
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDqYLl3pGyeSHw3y2C9oWqgrERxXt_ZfGo",
  authDomain: "serenely-11.firebaseapp.com",
  projectId: "serenely-11",
  storageBucket: "serenely-11.firebasestorage.app",
  messagingSenderId: "635219552771",
  appId: "1:635219552771:web:804159b24edbde1016bc36",
};

// Check if a Firebase app is already running to avoid re-initialization errors
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Auth only if it hasn't been initialized yet
let auth;
try {
  auth = getAuth(app);
} catch (e) {
  if (e.code === 'auth/internal-error' || e.code === 'auth/auth-not-initialized') {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
  } else {
    throw e;
  }
}
const db = getFirestore(app);

export {
  auth,
  db,
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp
};
