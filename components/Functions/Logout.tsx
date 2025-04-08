import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../../FirebaseConfig';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signOut } from "firebase/auth";

interface LogoutProps {
  onSuccess?: () => void;
  buttonStyle?: object;
  textStyle?: object;
  buttonText?: string;
}

export const logoutUser = async () => {
  try {
    // Sign out from Firebase
    await signOut(auth);
    
    // Clear persisted user data
    await AsyncStorage.removeItem("authUser");
    
    return true;
  } catch (error) {
    console.error("Error during logout:", error);
    return false;
  }
};

export default function Logout({ 
  onSuccess, 
  buttonStyle,
  textStyle,
  buttonText = "Sign Out" 
}: LogoutProps): JSX.Element {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const result = await logoutUser();
      if (result) {
        console.log('User signed out');
        
        // Call the onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        } else {
          // Default behavior: navigate to login
          router.replace('/login');
        }
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleLogout}
      style={[styles.button, buttonStyle]}
    >
      <Text style={[styles.buttonText, textStyle]}>{buttonText}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});


