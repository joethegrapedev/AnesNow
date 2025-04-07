import { useState, useEffect } from "react"
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
} from "react-native"
import { Camera, Image as ImageIcon, Check, Mail, Phone, Edit2 } from "react-native-feather"
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from "react-native-safe-area-context"
import { auth, db } from "../../FirebaseConfig"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"

// Define User interface to match Firestore document
interface User {
  name: string
  email: string
  phone: string
  role: "anaesthetist" | "clinic"
  profileImage: string
  bio?: string
  createdAt: Date
  updatedAt?: Date
  isProfileComplete: boolean
}

export default function ProfileScreen() {
  const [userData, setUserData] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState<User | null>(null)
  const [photoModalVisible, setPhotoModalVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch user data on component mount
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

  // Request permissions on component mount
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
      // Save changes
      await saveChanges()
    } else {
      // Start editing - copy current data to edited data
      setEditedData(userData)
    }
    setIsEditing(!isEditing)
  }

  const saveChanges = async () => {
    if (!editedData || !auth.currentUser) return

    setIsSaving(true)
    try {
      const userDocRef = doc(db, "users", auth.currentUser.uid)
      
      // Prepare update data
      const updateData = {
        name: editedData.name,
        phone: editedData.phone,
        bio: editedData.bio || "",
        profileImage: editedData.profileImage,
        updatedAt: new Date()
      }
      
      // Update Firestore document
      await updateDoc(userDocRef, updateData)
      
      // Update local state
      setUserData(editedData)
      
      Alert.alert("Success", "Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      Alert.alert("Error", "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  // Update the handleInputChange function with proper type annotations
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
      // For Android and other platforms, show modal
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
      
      // Create blob from URI
      const response = await fetch(uri)
      const blob = await response.blob()
      
      // Upload to Firebase Storage
      const storage = getStorage()
      const storageRef = ref(storage, `profile-images/${auth.currentUser.uid}/${Date.now()}`)
      
      const uploadTask = await uploadBytes(storageRef, blob)
      const downloadURL = await getDownloadURL(uploadTask.ref)
      
      // Update image in edited data
      handleInputChange("profileImage", downloadURL)
      
    } catch (error) {
      console.error("Error uploading image:", error)
      Alert.alert("Error", "Failed to upload profile image")
    } finally {
      setIsSaving(false)
    }
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
          {/* Header */}
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

          {/* Profile Image */}
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

          {/* Profile Info */}
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Photo Options Modal (for Android and other platforms) */}
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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // bg-gray-50
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
  header: {
    backgroundColor: '#4F46E5', // bg-indigo-600
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
    backgroundColor: '#6366F1', // bg-indigo-500
    padding: 8,
    borderRadius: 9999,
  },
  disabledButton: {
    opacity: 0.7,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: -64, // -mt-16
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
    backgroundColor: '#6366F1', // bg-indigo-500
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
    color: '#6B7280', // text-gray-500
    fontSize: 14,
    marginBottom: 8,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: '#6B7280', // text-gray-500
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
    color: '#1F2937', // text-gray-800
    fontSize: 18,
    fontWeight: '600', // font-semibold
  },
  fieldValueBio: {
    color: '#374151', // text-gray-700
  },
  fieldValueWithPadding: {
    color: '#374151', // text-gray-700
    paddingLeft: 24,
  },
  textInput: {
    backgroundColor: '#F3F4F6', // bg-gray-100
    borderRadius: 8,
    padding: 12,
    color: '#1F2937', // text-gray-800
  },
  cancelButton: {
    backgroundColor: '#FEE2E2', // bg-red-100
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#DC2626', // text-red-600
    fontWeight: '500', // font-medium
  },
  refreshButton: {
    backgroundColor: '#F3F4F6', // bg-gray-100
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#4F46E5', // text-indigo-600
    fontWeight: '500', // font-medium
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
    backgroundColor: '#D1D5DB', // bg-gray-300
    borderRadius: 9999,
  },
  modalTitle: {
    color: '#1F2937', // text-gray-800
    fontSize: 18,
    fontWeight: '600', // font-semibold
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
    color: '#1F2937', // text-gray-800
    fontSize: 18,
  },
  modalCancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB', // border-gray-200
  },
  modalCancelText: {
    color: '#EF4444', // text-red-500
    fontSize: 18,
    fontWeight: '500', // font-medium
  },
  loadingText: {
    color: '#6B7280', // text-gray-500
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#EF4444', // text-red-500
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4F46E5', // bg-indigo-600
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '500', // font-medium
  },
  anaesthetistText: {
    color: '#4F46E5', // indigo-600
  },
  clinicText: {
    color: '#0891B2', // cyan-600
  }
});

