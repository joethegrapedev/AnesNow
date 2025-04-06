import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../../FirebaseConfig';

interface LogoutProps {
  onSuccess?: () => void;
  buttonStyle?: object;
  textStyle?: object;
  buttonText?: string;
}

export default function Logout({ 
  onSuccess, 
  buttonStyle,
  textStyle,
  buttonText = "Sign Out" 
}: LogoutProps): JSX.Element {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      console.log('User signed out');
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Default behavior: navigate to login
        router.replace('/login');
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


