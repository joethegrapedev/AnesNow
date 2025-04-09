import React, { ReactNode, useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { auth, db } from '../../FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, User } from 'firebase/auth';

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const redirectInProgress = useRef(false);
  const authCheckComplete = useRef(false);
  
  // This effect handles the auth state
  useEffect(() => {
    // Prevent multiple auth checks
    if (authCheckComplete.current) return;
    
    const checkAuth = async () => {
      // Start listening for auth changes
      const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
        // Don't do anything if a redirect is already in progress
        if (redirectInProgress.current) return;
        
        if (!user) {
          // No Firebase auth session - only redirect if on a protected route
          if (pathname.includes('/(Personal)') || pathname.includes('/(Clinic)') || pathname.includes('/(setup)')) {
            redirectInProgress.current = true;
            router.replace('/login');
          } else {
            // If not on a protected route, just finish loading
            setIsLoading(false);
          }
          return;
        }
        
        // User is logged in with Firebase
        try {
          // Check if the user profile exists
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            // No user document, redirect to profile setup if not already there
            if (pathname !== '/(setup)/Details') {
              redirectInProgress.current = true;
              router.replace('/(setup)/Details');
              return;
            }
          }
          
          const userData = userDoc.data();
          
          // Make sure userData exists before accessing its properties
          if (!userData) {
            // Handle the case when userData is undefined
            console.log("User data not found");
            // Redirect to login or another appropriate page
            router.replace('/login');
            return;
          }
          
          // Now TypeScript knows userData is defined
          // Store the role in AsyncStorage
          await AsyncStorage.setItem("userRole", userData.role || "");
          
          // Check if profile is incomplete
          if (!userData.isProfileComplete) {
            // Profile is incomplete, redirect to Details page if not already there
            if (pathname !== '/(setup)/Details') {
              redirectInProgress.current = true;
              router.replace('/(setup)/Details');
              return;
            }
          }
          
          // Profile is complete, check if user is in the correct section
          if (userData.isProfileComplete) {
            // Determine if user is on wrong section or landing page
            const isLandingPage = pathname === '/' || 
                                  pathname === '/index' || 
                                  pathname === '/loading';
            
            const isAuthenticatedNonSetupPage = 
              !pathname.includes('/(setup)') && 
              !pathname.includes('/login') && 
              !pathname.includes('/Roleselection');
            
            const isInWrongSection = 
              (userData.role === 'anaesthetist' && pathname.includes('/(Clinic)')) ||
              (userData.role === 'clinic' && pathname.includes('/(Personal)'));
            
            // Only redirect if user is on wrong section or landing page
            if ((isLandingPage || isInWrongSection) && isAuthenticatedNonSetupPage) {
              console.log(`Redirecting ${userData.role} to appropriate dashboard`);
              redirectInProgress.current = true;
              
              if (userData.role === 'anaesthetist') {
                router.replace('/(Personal)/Dashboard');
              } else if (userData.role === 'clinic') {
                router.replace('/(Clinic)/ClinicDashboard');
              }
              return;
            }
          }
          
          // User is in the correct place, finish loading
          setIsLoading(false);
        } catch (error) {
          console.error("Error in auth provider:", error);
          setIsLoading(false);
        }
      });
      
      // Mark auth check as started
      authCheckComplete.current = true;
      
      // Return cleanup function
      return unsubscribe;
    };
    
    checkAuth();
  }, [pathname, router]); // Empty dependency array - run only once
  
  // Reset the redirect flag when path changes
  useEffect(() => {
    redirectInProgress.current = false;
  }, [pathname]);
  
  // Add a safety timeout to prevent being stuck in loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log("Safety timeout: forcing load completion after 5 seconds");
        setIsLoading(false);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [isLoading]);
  
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }
  
  return <>{children}</>;
}