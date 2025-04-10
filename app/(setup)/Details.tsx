import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { auth, db } from "../../FirebaseConfig";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function Details() {
  // Common fields for both roles
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [userRole, setUserRole] = useState<"anaesthetist" | "clinic" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  // Clinic-specific fields
  const [clinicName, setClinicName] = useState("");
  const [clinicPhone, setClinicPhone] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  
  const router = useRouter();

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const savedRole = await AsyncStorage.getItem("userRole");
        if (savedRole === "anaesthetist" || savedRole === "clinic") {
          setUserRole(savedRole);
        } else {
          // If no role is saved, redirect to role selection
          router.replace("/Roleselection");
        }

        // Check if user is authenticated
        const user = auth.currentUser;
        if (!user) {
          router.replace("/login");
          return;
        }

        // Check if any user data already exists
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.name) setName(userData.name);
          if (userData.phone) setPhone(userData.phone);
          if (userData.profileImage) setProfileImage(userData.profileImage);
          
          // Load clinic-specific data if available
          if (userData.clinicName) setClinicName(userData.clinicName);
          if (userData.clinicPhone) setClinicPhone(userData.clinicPhone);
          if (userData.clinicAddress) setClinicAddress(userData.clinicAddress);
        }
      } catch (error) {
        console.error("Error checking user role:", error);
      }
    };

    checkUserRole();
  }, []);

  const handlePickImage = async () => {
    // Your existing image picker code
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setIsUploading(true);
      try {
        const uri = result.assets[0].uri;
        
        // Upload image to Firebase Storage and get URL
        const imageUrl = await uploadProfileImage(uri);
        setProfileImage(imageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Failed to upload image. You can complete your profile without an image.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const uploadProfileImage = async (uri: string): Promise<string> => {
    // Your existing upload code
    const user = auth.currentUser;
    if (!user) throw new Error("No user logged in");
    
    // Create blob from URI
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Upload to Firebase Storage
    const storage = getStorage();
    const storageRef = ref(storage, `profile-images/${user.uid}/${Date.now()}`);
    
    const uploadTask = await uploadBytes(storageRef, blob);
    return getDownloadURL(uploadTask.ref);
  };

  const handleSaveDetails = async () => {
    // Modified validation to check appropriate fields based on role
    if (userRole === "anaesthetist") {
      if (!name.trim()) {
        alert("Please enter your full name");
        return;
      }
      
      if (!phone.trim()) {
        alert("Please enter your phone number");
        return;
      }
    } else if (userRole === "clinic") {
      if (!name.trim()) {
        alert("Please enter the surgeon's name");
        return;
      }
      
      if (!clinicName.trim()) {
        alert("Please enter the clinic name");
        return;
      }
      
      if (!clinicPhone.trim()) {
        alert("Please enter the clinic phone number");
        return;
      }
      
      if (!clinicAddress.trim()) {
        alert("Please enter the clinic address");
        return;
      }
    }

    const user = auth.currentUser;
    if (!user) {
      router.replace("/login");
      return;
    }

    setIsLoading(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      
      // Create base update data
      const updateData: any = {
        name,
        phone,
        isProfileComplete: true,
        updatedAt: new Date()
      };
      
      // Add profile image if available
      if (profileImage) {
        updateData.profileImage = profileImage;
      }
      
      // Add clinic-specific fields if the user is a clinic
      if (userRole === "clinic") {
        updateData.clinicName = clinicName;
        updateData.clinicPhone = clinicPhone;
        updateData.clinicAddress = clinicAddress;
      }
      
      await updateDoc(userDocRef, updateData);
      
      // Navigate to the appropriate dashboard based on role
      if (userRole === "anaesthetist") {
        router.replace("/(Personal)/Dashboard");
      } else if (userRole === "clinic") {
        router.replace("/(Clinic)/ClinicDashboard");
      }
    } catch (error: any) {
      console.error("Error saving user details:", error);
      alert(`Failed to save details: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Skip photo button handler
  const handleSkipPhoto = () => {
    setProfileImage(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>
              Please provide some details to get started as a{" "}
              <Text style={userRole === "anaesthetist" ? styles.anaesthetistText : styles.clinicText}>
                {userRole === "anaesthetist" ? "Anaesthetist" : "Clinic"}
              </Text>
            </Text>
          </View>

          <View style={styles.imageContainer}>
            <View style={styles.profileImageWrapper}>
              <Image 
                source={{ 
                  uri: profileImage || "https://cdn-icons-png.flaticon.com/512/6522/6522516.png"
                }} 
                style={styles.profileImage} 
              />
              {isUploading && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="small" color="#ffffff" />
                </View>
              )}
            </View>
            
            <View style={styles.photoButtonsContainer}>
              <TouchableOpacity 
                style={styles.photoButton} 
                onPress={handlePickImage}
                disabled={isUploading}
              >
                <Feather name="camera" size={18} color="#4F46E5" />
                <Text style={styles.photoButtonText}>
                  {profileImage ? "Change Photo" : "Add Photo"}
                </Text>
              </TouchableOpacity>
              
              {profileImage && (
                <TouchableOpacity 
                  style={styles.skipPhotoButton} 
                  onPress={handleSkipPhoto}
                  disabled={isUploading}
                >
                  <Text style={styles.skipPhotoText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <Text style={styles.optionalText}>Profile photo (optional)</Text>
          </View>

          <View style={styles.formContainer}>
            {/* Common fields for both roles */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {userRole === "anaesthetist" ? "Full Name" : "Surgeon Name"}
              </Text>
              <View style={styles.inputContainer}>
                <Feather name="user" size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={userRole === "anaesthetist" ? "Enter your full name" : "Enter surgeon name"}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* Show phone number for anaesthetist */}
            {userRole === "anaesthetist" && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.inputContainer}>
                  <Feather name="phone" size={20} color="#666666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your phone number"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            )}

            {/* Clinic-specific fields */}
            {userRole === "clinic" && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Clinic Name</Text>
                  <View style={styles.inputContainer}>
                    <Feather name="home" size={20} color="#666666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter clinic name"
                      value={clinicName}
                      onChangeText={setClinicName}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Clinic Phone</Text>
                  <View style={styles.inputContainer}>
                    <Feather name="phone" size={20} color="#666666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter clinic phone number"
                      value={clinicPhone}
                      onChangeText={setClinicPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Clinic Address</Text>
                  <View style={styles.inputContainer}>
                    <Feather name="map-pin" size={20} color="#666666" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Enter clinic address"
                      value={clinicAddress}
                      onChangeText={setClinicAddress}
                      multiline={true}
                      numberOfLines={3}
                      textAlignVertical="top"
                      style={[styles.input, styles.multilineInput]}
                    />
                  </View>
                </View>
              </>
            )}

            {/* Role-specific help text */}
            {userRole === "anaesthetist" && (
              <View style={styles.infoBox}>
                <Feather name="info" size={20} color="#4f46e5" style={styles.infoIcon} />
                <Text style={styles.infoText}>
                  You can add more details to your professional profile later.
                </Text>
              </View>
            )}

            {userRole === "clinic" && (
              <View style={styles.infoBox}>
                <Feather name="info" size={20} color="#0891b2" style={styles.infoIcon} />
                <Text style={styles.infoText}>
                  You'll be able to post anaesthesia opportunities once your profile is complete.
                </Text>
              </View>
            )}

            {/* Save button with appropriate validation */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                userRole === "anaesthetist" ? styles.anaesthetistButton : styles.clinicButton,
                (isLoading || isUploading || 
                  (userRole === "anaesthetist" && (!name || !phone)) || 
                  (userRole === "clinic" && (!name || !clinicName || !clinicPhone || !clinicAddress))
                ) && styles.disabledButton,
              ]}
              onPress={handleSaveDetails}
              disabled={isLoading || isUploading || 
                (userRole === "anaesthetist" && (!name || !phone)) || 
                (userRole === "clinic" && (!name || !clinicName || !clinicPhone || !clinicAddress))}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.saveButtonText}>Save & Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Your existing styles
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f7",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  anaesthetistText: {
    color: "#4f46e5",
    fontWeight: "600",
  },
  clinicText: {
    color: "#0891b2",
    fontWeight: "600",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  profileImageWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e5e7eb",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  photoButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF", // light indigo
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  photoButtonText: {
    marginLeft: 8,
    color: "#4F46E5", // indigo
    fontWeight: "500",
  },
  skipPhotoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  skipPhotoText: {
    color: "#6B7280", // gray-500
  },
  optionalText: {
    color: "#6B7280", // gray-500
    fontSize: 14,
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: "#4b5563",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: "#1f2937",
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 16,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    padding: 16,
    marginTop: 8,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    color: "#4b5563",
    fontSize: 14,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  anaesthetistButton: {
    backgroundColor: "#4f46e5",
  },
  clinicButton: {
    backgroundColor: "#0891b2",
  },
  disabledButton: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});