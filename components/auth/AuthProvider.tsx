import React, { ReactNode, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../../FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      // Check if there's a Firebase auth session
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          // No Firebase auth session
          // Check if we have a stored session
          try {
            const storedAuth = await AsyncStorage.getItem('authUser');
            const staySignedIn = await AsyncStorage.getItem('staySignedIn');
            
            if (storedAuth && staySignedIn === 'true') {
              // We have stored auth data, but Firebase session expired
              // For security reasons, we won't auto-login
              // Just redirect to login screen
              router.replace('/login');
            } else {
              // No stored auth or user chose not to stay signed in
              router.replace('/login');
            }
          } catch (error) {
            console.error("Error checking stored auth:", error);
            router.replace('/login');
          }
          return;
        }
        
        // User is logged in with Firebase
        try {
          // Check if the user profile is complete
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists() || !userDoc.data().isProfileComplete) {
            // Profile is incomplete, redirect to Details page
            router.replace('/(setup)/Details');
            return;
          }
          
          // User is signed in and profile is complete, continue rendering children
          setIsLoading(false);
        } catch (error) {
          console.error("Error checking profile completion:", error);
          // On error, default to allowing access
          setIsLoading(false);
        }
      });
      
      // Cleanup subscription
      return unsubscribe;
    };
    
    checkAuth();
  }, []);
  
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }
  
  return <>{children}</>;
}