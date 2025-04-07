// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { initializeAuth, getAuth, Auth } from "firebase/auth";
import { Platform } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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
export const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize analytics only if supported and we're on web
export const analytics = async () => {
  if (Platform.OS === 'web' && await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};

// Properly typed auth instance
export let auth: Auth;

// React Native specific setup
if (Platform.OS !== 'web') {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} else {
  // Web environment
  auth = getAuth(app);
}
