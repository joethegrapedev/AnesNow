import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
  ActionSheetIOS,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
} from "react-native"
import { Camera, Image as ImageIcon, Check, Mail, Phone, Edit2, X } from "react-native-feather"
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from "react-native-safe-area-context"
import { auth, db } from "../../FirebaseConfig"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { User } from "../../types/models/User"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { signOut } from "firebase/auth"

export default function ProfileScreen() {
  const [userData, setUserData] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState<User | null>(null)
  const [photoModalVisible, setPhotoModalVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showLogoutNotification, setShowLogoutNotification] = useState(false)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    setIsLoading(true)
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error("No user is logged in")
      }

      const userDocRef = doc(db, "users", user.uid)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        const userData = userDoc.data() as User
        setUserData(userData)
        setEditedData(userData)
      } else {
        Alert.alert("Error", "User profile not found")
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      Alert.alert("Error", "Failed to load profile data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    ;(async () => {
      if (Platform.OS !== "web") {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync()
        const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync()

        if (cameraStatus !== "granted" || libraryStatus !== "granted") {
          alert("Sorry, we need camera and photo library permissions to make this work!")
        }
      }
    })()
  }, [])

  const handleEditToggle = async () => {
    if (isEditing && editedData) {
      await saveChanges()
    } else {
      setEditedData(userData)
    }
    setIsEditing(!isEditing)
  }

  const saveChanges = async () => {
    if (!editedData || !auth.currentUser) return

    setIsSaving(true)
    try {
      const userDocRef = doc(db, "users", auth.currentUser.uid)
      
      const updateData = {
        name: editedData.name,
        phone: editedData.phone,
        bio: editedData.bio || "",
        profileImage: editedData.profileImage,
        updatedAt: new Date()
      }
      
      await updateDoc(userDocRef, updateData)
      
      setUserData(editedData)
      
      Alert.alert("Success", "Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      Alert.alert("Error", "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof User, value: string) => {
    if (!editedData) return
    
    setEditedData((prev) => ({
      ...prev!,
      [field]: value,
    }))
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedData(userData)
  }

  const openPhotoOptions = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Take Photo", "Choose from Library"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhoto()
          } else if (buttonIndex === 2) {
            pickImage()
          }
        },
      )
    } else {
      setPhotoModalVisible(true)
    }
  }

  const takePhoto = async () => {
    setPhotoModalVisible(false)

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,  
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri
      await uploadAndSetImage(uri)
    }
  }

  const pickImage = async () => {
    setPhotoModalVisible(false)

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri
      await uploadAndSetImage(uri)
    }
  }

  const uploadAndSetImage = async (uri: string) => {
    if (!auth.currentUser) return
    
    try {
      setIsSaving(true)
      
      const response = await fetch(uri)
      const blob = await response.blob()
      
      const storage = getStorage()
      const storageRef = ref(storage, `profile-images/${auth.currentUser.uid}/${Date.now()}`)
      
      const uploadTask = await uploadBytes(storageRef, blob)
      const downloadURL = await getDownloadURL(uploadTask.ref)
      
      handleInputChange("profileImage", downloadURL)
      
    } catch (error) {
      console.error("Error uploading image:", error)
      Alert.alert("Error", "Failed to upload profile image")
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogoutStart = () => {
    console.log("Logout process started");
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (showLogoutNotification) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        })
      ]).start()

      timerRef.current = setTimeout(() => {
        handleLogoutConfirm()
      }, 3000)
    } else {
      fadeAnim.setValue(0)
      scaleAnim.setValue(0.8)
    }
  }, [showLogoutNotification])

  const handleLogoutPress = () => {
    setShowLogoutNotification(true)
  }

  const handleLogoutConfirm = async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(async () => {
      setShowLogoutNotification(false)
      
      try {
        await signOut(auth)
        
        await AsyncStorage.removeItem("authUser")
        await AsyncStorage.removeItem("userRole")
        
        router.replace('/Roleselection')
      } catch (error) {
        console.error("Error during logout:", error)
        Alert.alert("Error", "Failed to log out")
      }
    })
  }

  const handleLogoutCancel = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowLogoutNotification(false)
    })
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    )
  }

  if (!userData) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Couldn't load profile data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.flex1}
      >
        <ScrollView style={styles.flex1}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>My Profile</Text>
              <TouchableOpacity 
                style={[styles.editButton, isSaving && styles.disabledButton]} 
                onPress={handleEditToggle}
                disabled={isSaving}
              >
                {isEditing ? (
                  isSaving ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Check width={20} height={20} stroke="#ffffff" />
                  )
                ) : (
                  <Edit2 width={20} height={20} stroke="#ffffff" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.profileImageContainer}>
            <View style={styles.profileImageWrapper}>
              <View style={styles.profileImageBorder}>
                <Image
                  source={{ 
                    uri: isEditing && editedData 
                      ? editedData.profileImage 
                      : userData.profileImage || "https://cdn-icons-png.flaticon.com/512/6522/6522516.png"
                  }}
                  style={styles.profileImage}
                />
              </View>

              {isEditing && (
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={openPhotoOptions}
                  disabled={isSaving}
                >
                  <Camera width={20} height={20} stroke="#ffffff" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.profileInfoContainer}>
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Name</Text>
                {isEditing && editedData ? (
                  <TextInput
                    style={styles.textInput}
                    value={editedData.name}
                    onChangeText={(text) => handleInputChange("name", text)}
                    editable={!isSaving}
                  />
                ) : (
                  <Text style={styles.fieldValueName}>{userData.name}</Text>
                )}
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Bio</Text>
                {isEditing && editedData ? (
                  <TextInput
                    style={styles.textInput}
                    value={editedData.bio || ""}
                    onChangeText={(text) => handleInputChange("bio", text)}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    editable={!isSaving}
                    placeholder="Add a short bio about yourself..."
                  />
                ) : (
                  <Text style={styles.fieldValueBio}>
                    {userData.bio || "No bio provided"}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>CONTACT INFORMATION</Text>

              <View style={styles.fieldContainer}>
                <View style={styles.iconLabelContainer}>
                  <Phone width={16} height={16} stroke="#6B7280" style={styles.iconMargin} />
                  <Text style={styles.fieldLabel}>Phone Number</Text>
                </View>
                {isEditing && editedData ? (
                  <TextInput
                    style={styles.textInput}
                    value={editedData.phone}
                    onChangeText={(text) => handleInputChange("phone", text)}
                    keyboardType="phone-pad"
                    editable={!isSaving}
                  />
                ) : (
                  <Text style={styles.fieldValueWithPadding}>{userData.phone}</Text>
                )}
              </View>

              <View style={styles.fieldContainer}>
                <View style={styles.iconLabelContainer}>
                  <Mail width={16} height={16} stroke="#6B7280" style={styles.iconMargin} />
                  <Text style={styles.fieldLabel}>Email</Text>
                </View>
                <Text style={styles.fieldValueWithPadding}>{userData.email}</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>ACCOUNT INFORMATION</Text>
              
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Account Type</Text>
                <Text style={[
                  styles.fieldValueName, 
                  userData.role === "anaesthetist" ? styles.anaesthetistText : styles.clinicText
                ]}>
                  {userData.role === "anaesthetist" ? "Anaesthetist" : "Clinic"}
                </Text>
              </View>
            </View>

            {isEditing && (
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleCancel}
                disabled={isSaving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.refreshButton} onPress={fetchUserData}>
              <Text style={styles.refreshButtonText}>Refresh Profile Data</Text>
            </TouchableOpacity>

            <View style={styles.logoutContainer}>
              <TouchableOpacity
                style={styles.customLogoutButton}
                onPress={handleLogoutPress}
              >
                <Text style={styles.customLogoutText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={photoModalVisible}
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setPhotoModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle}>
              <View style={styles.modalHandleBar} />
            </View>

            <Text style={styles.modalTitle}>Change Profile Photo</Text>

            <TouchableOpacity style={styles.modalOption} onPress={takePhoto}>
              <Camera width={24} height={24} stroke="#4F46E5" style={styles.modalOptionIcon} />
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOption} onPress={pickImage}>
              <ImageIcon width={24} height={24} stroke="#4F46E5" style={styles.modalOptionIcon} />
              <Text style={styles.modalOptionText}>Choose from Library</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setPhotoModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {showLogoutNotification && (
        <View style={styles.logoutOverlay}>
          <Animated.View 
            style={[
              styles.logoutBackdrop, 
              { opacity: fadeAnim }
            ]} 
          />
          <Animated.View
            style={[
              styles.logoutNotification,
              { 
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <Text style={styles.logoutNotificationText}>You have been logged out</Text>
            <TouchableOpacity 
              style={styles.logoutCloseButton}
              onPress={handleLogoutConfirm}
            >
              <X width={20} height={20} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
  header: {
    backgroundColor: '#4F46E5',
    paddingTop: 16,
    paddingBottom: 80,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#6366F1',
    padding: 8,
    borderRadius: 9999,
  },
  disabledButton: {
    opacity: 0.7,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: -64,
    marginBottom: 24,
  },
  profileImageWrapper: {
    position: 'relative',
  },
  profileImageBorder: {
    backgroundColor: 'white',
    padding: 4,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  profileImage: {
    width: 128,
    height: 128,
    borderRadius: 9999,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6366F1',
    padding: 8,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: 'white',
  },
  profileInfoContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 8,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 4,
  },
  iconLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconMargin: {
    marginRight: 8,
  },
  fieldValueName: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '600',
  },
  fieldValueBio: {
    color: '#374151',
  },
  fieldValueWithPadding: {
    color: '#374151',
    paddingLeft: 24,
  },
  textInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    color: '#1F2937',
  },
  cancelButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#DC2626',
    fontWeight: '500',
  },
  refreshButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#4F46E5',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
  },
  modalHandle: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHandleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 9999,
  },
  modalTitle: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
  },
  modalOptionIcon: {
    marginRight: 12,
  },
  modalOptionText: {
    color: '#1F2937',
    fontSize: 18,
  },
  modalCancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalCancelText: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: '500',
  },
  loadingText: {
    color: '#6B7280',
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  anaesthetistText: {
    color: '#4F46E5',
  },
  clinicText: {
    color: '#0891B2',
  },
  logoutContainer: {
    marginTop: 24,
    marginBottom: 32,
    position: 'relative',
    zIndex: 1,
  },
  customLogoutButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  customLogoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  logoutBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  logoutNotification: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    width: Dimensions.get('window').width * 0.85,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  logoutNotificationText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
    textAlign: 'center',
  },
  logoutCloseButton: {
    padding: 4,
  },
})

