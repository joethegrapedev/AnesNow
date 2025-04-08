// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { initializeAuth, getAuth, Auth } from "firebase/auth";
import { Platform } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
// Keep your existing import path since it's working
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB-w-WxQDmUzJqJ72qPTFkrIN9rQOvrOng",
  authDomain: "anaesthesia-now.firebaseapp.com",
  projectId: "anaesthesia-now",
  storageBucket: "anaesthesia-now.firebasestorage.app",
  messagingSenderId: "522957473787",
  appId: "1:522957473787:web:c4cbbf8a62b3d4dc8c2d5e",
  measurementId: "G-TZ3RQHJBCF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Create platform-specific auth instance with explicit typing
let auth: Auth;
if (Platform.OS === 'web') {
  // For web, use standard auth
  auth = getAuth(app);
} else {
  // For mobile, use persistence - keeping your persistence setup
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

// Initialize other Firebase services with explicit typing
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

// Initialize analytics conditionally - keeping your conditional setup
let analytics: Analytics | null = null;
if (Platform.OS === 'web') {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, storage, analytics };

