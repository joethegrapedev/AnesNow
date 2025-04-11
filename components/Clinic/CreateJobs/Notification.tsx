import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, SafeAreaView, KeyboardAvoidingView, Animated, TouchableOpacity } from 'react-native';
import { CheckCircle, AlertTriangle, Info, X } from "react-native-feather";

// Define props interface
export interface NotificationProps {
  message: string;
  type: "success" | "error" | "info";
  visible: boolean;
  onHide: () => void;
  autoHideDuration?: number;
}

const Notification: React.FC<NotificationProps> = ({
  message,
  type,
  visible,
  onHide,
  autoHideDuration = 3000,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      // Show animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
      
      // Set auto-hide timer
      if (autoHideDuration > 0) {
        timerRef.current = setTimeout(() => {
          hideNotification();
        }, autoHideDuration);
      }
    } else {
      hideNotification();
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [visible]);

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      if (visible) onHide();
    });
  };
  
  // Don't render anything if not visible and fully hidden
  if (!visible && opacity._value === 0) return null;
  
  return (
    <Animated.View 
      style={[
        styles.notificationContainer,
        { 
          backgroundColor: type === 'success' ? '#10B981' : 
                         type === 'error' ? '#EF4444' : '#3B82F6',
          transform: [{ translateY }],
          opacity
        }
      ]}
    >
      <View style={styles.notificationContent}>
        {type === 'success' && <CheckCircle width={20} height={20} stroke="#FFFFFF" />}
        {type === 'error' && <AlertTriangle width={20} height={20} stroke="#FFFFFF" />}
        {type === 'info' && <Info width={20} height={20} stroke="#FFFFFF" />}
        
        <Text style={styles.notificationMessage}>{message}</Text>
        
        <TouchableOpacity onPress={hideNotification} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <X width={16} height={16} stroke="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const App = () => {
  const notificationMessage = "Operation Successful!";
  const notificationType = "success";
  const showSuccessNotification = true;
  const handleNotificationHide = () => {
    console.log("Notification hidden");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Place the Notification component here, before anything else */}
      <Notification 
        message={notificationMessage}
        type={notificationType}
        visible={showSuccessNotification}
        onHide={handleNotificationHide}
        autoHideDuration={2500} // 2.5 seconds is a good time before navigation
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={100}
      >
        {/* Rest of your UI */}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  notificationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 5,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationMessage: {
    flex: 1,
    marginLeft: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
});

export default App;