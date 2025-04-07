import React, { ReactNode, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../../FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        // No user is signed in, redirect to login
        router.replace('/login');
        return;
      }
      
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