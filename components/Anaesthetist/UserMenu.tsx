import { useRef, useEffect } from "react"
import { View, TouchableOpacity, Text, Animated, Pressable, StyleSheet } from "react-native"
import { User } from "react-native-feather"
import { router } from "expo-router"
import Logout from "../auth/Logout"
    
interface UserMenuProps {
  isVisible: boolean
  onClose: () => void
  onLogout: () => void
}

export default function UserMenu({ isVisible, onClose, onLogout }: UserMenuProps) {
  const slideAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [isVisible, slideAnim, fadeAnim])

  const handleProfilePress = () => {
    onClose()
    router.push("/(Personal)/Profile")
  }

  const handleLogoutPress = () => {
    onClose()
    onLogout()
  }

  if (!isVisible) return null

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Animated.View 
        style={[
          styles.backdrop, 
          { opacity: fadeAnim }
        ]} 
      />
      <Animated.View
        style={[
          styles.menuContainer,
          {
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
            opacity: fadeAnim,
          }
        ]}
      >
        <View style={styles.menuContent}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleProfilePress}
          >
            <User width={20} height={20} stroke="#4B5563" />
            <Text style={styles.menuItemText}>Profile</Text>
          </TouchableOpacity>

          <View style={styles.logoutContainer}>
            <Logout
              buttonStyle={{ backgroundColor: "black" }}
              textStyle={{ fontSize: 16 }}
              buttonText="Log Out"
              onSuccess={handleLogoutPress}
            />
          </View>
        </View>
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menuContainer: {
    position: 'absolute',
    right: 16,
    top: 56,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: 224,
    overflow: 'hidden',
    zIndex: 50,
  },
  menuContent: {
    padding: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  menuItemText: {
    marginLeft: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  logoutContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  }
});

