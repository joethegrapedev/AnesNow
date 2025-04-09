import React, { useState, useRef, useEffect } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Animated, 
  View,
  TouchableWithoutFeedback
} from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../../../FirebaseConfig';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signOut } from "firebase/auth";
import { X } from 'react-native-feather';

interface CustomLogoutButtonProps {
  buttonStyle?: object;
  textStyle?: object;
  buttonText?: string;
  onLogoutStart?: () => void;
}

export default function CustomLogoutButton({
  buttonStyle,
  textStyle,
  buttonText = "Log Out",
  onLogoutStart
}: CustomLogoutButtonProps): JSX.Element {
  const router = useRouter();
  const [showNotification, setShowNotification] = useState(false);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      // Clean up timer if component unmounts
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (showNotification) {
      // Slide in notification
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Set timer for automatic dismiss after 3 seconds
      timerRef.current = setTimeout(() => {
        dismissAndRedirect();
      }, 3000);
    } else {
      // Reset animation value when notification is hidden
      slideAnim.setValue(-100);
    }
  }, [showNotification]);

  const logoutUser = async () => {
    try {
      // If there's a callback for logout start, call it
      if (onLogoutStart) {
        onLogoutStart();
      }
      
      // Show notification
      setShowNotification(true);
      
      return true;
    } catch (error) {
      console.error("Error during logout:", error);
      return false;
    }
  };

  const dismissAndRedirect = async () => {
    // Clear the auto-dismiss timer if it exists
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    // Slide out notification
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(async () => {
      setShowNotification(false);
      
      // Sign out from Firebase
      await signOut(auth);
      
      // Clear persisted user data
      await AsyncStorage.removeItem("authUser");
      await AsyncStorage.removeItem("userRole");
      
      // Navigate to role selection
      router.replace('/Roleselection');
    });
  };

  const handleLogoutPress = async () => {
    await logoutUser();
  };

  return (
    <>
      <TouchableOpacity
        onPress={handleLogoutPress}
        style={[styles.button, buttonStyle]}
      >
        <Text style={[styles.buttonText, textStyle]}>{buttonText}</Text>
      </TouchableOpacity>
      
      {showNotification && (
        <Animated.View
          style={[
            styles.notification,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <Text style={styles.notificationText}>You have been logged out</Text>
          <TouchableWithoutFeedback onPress={dismissAndRedirect}>
            <View style={styles.closeButton}>
              <X width={20} height={20} color="#FFFFFF" />
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#EF4444', // Bright red
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%', // Make button full width
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  notification: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#EF4444', // Bright red
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  notificationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
  },
});