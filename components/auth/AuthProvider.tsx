import React, { ReactNode, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../../FirebaseConfig';

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        // No user is signed in, redirect to login
        router.replace('/login');
      } else {
        // User is signed in, continue rendering children
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