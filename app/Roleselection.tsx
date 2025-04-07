import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { auth, db } from "../FirebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RoleSelection() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"anaesthetist" | "clinic" | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if a role is already saved in AsyncStorage on component mount
  useEffect(() => {
    const checkSavedRole = async () => {
      try {
        const savedRole = await AsyncStorage.getItem("userRole");
        if (savedRole === "anaesthetist" || savedRole === "clinic") {
          setSelectedRole(savedRole);
        }
      } catch (error) {
        console.error("Error retrieving saved role:", error);
      }
    };

    checkSavedRole();
  }, []);

  const handleRoleSelect = async () => {
    if (!selectedRole) {
      alert("Please select a role to continue");
      return;
    }

    setIsLoading(true);
    
    try {
      // Save the selected role to AsyncStorage for future sessions
      await AsyncStorage.setItem("userRole", selectedRole);
      
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        // User is already authenticated, update their role
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          // Update existing user document with new role
          await setDoc(userDocRef, { role: selectedRole }, { merge: true });
        } else {
          // Create new user document with basic info
          await setDoc(userDocRef, {
            email: currentUser.email,
            role: selectedRole,
            createdAt: new Date(),
          });
        }
        
        // Redirect to the appropriate dashboard
        router.replace("/(Personal)/Dashboard");
      } else {
        // User is not authenticated, redirect to login
        router.push("/login");
      }
      
    } catch (error: any) {
      console.error("Error saving role:", error);
      alert(`Failed to save role: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Image 
            source={{ uri: "https://cdn-icons-png.flaticon.com/512/6522/6522516.png" }}
            style={styles.logo} 
          />
          <Text style={styles.title}>Choose Your Role</Text>
          <Text style={styles.subtitle}>
            Select how you'll be using Anaesthesia Now
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.roleOption,
              selectedRole === "anaesthetist" && styles.selectedOption,
              selectedRole === "anaesthetist" && { borderColor: "#4f46e5" },
            ]}
            onPress={() => setSelectedRole("anaesthetist")}
          >
            <View style={[
              styles.iconContainer, 
              selectedRole === "anaesthetist" && styles.selectedIconContainer,
              selectedRole === "anaesthetist" && { backgroundColor: "#4f46e5" },
            ]}>
              <Feather
                name="user"
                size={32}
                color={selectedRole === "anaesthetist" ? "#ffffff" : "#4f46e5"}
              />
            </View>
            <View style={styles.roleTextContainer}>
              <Text style={styles.roleTitle}>I'm an Anaesthetist</Text>
              <Text style={styles.roleDescription}>
                I want to find and accept anaesthesia opportunities
              </Text>
            </View>
            {selectedRole === "anaesthetist" && (
              <Feather name="check-circle" size={24} color="#4f46e5" style={styles.checkIcon} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleOption,
              selectedRole === "clinic" && styles.selectedOption,
              selectedRole === "clinic" && { borderColor: "#0891b2" },
            ]}
            onPress={() => setSelectedRole("clinic")}
          >
            <View style={[
              styles.iconContainer, 
              selectedRole === "clinic" && styles.selectedIconContainer,
              selectedRole === "clinic" && { backgroundColor: "#0891b2" },
            ]}>
              <Feather
                name="home"
                size={32}
                color={selectedRole === "clinic" ? "#ffffff" : "#0891b2"}
              />
            </View>
            <View style={styles.roleTextContainer}>
              <Text style={styles.roleTitle}>I'm a Clinic</Text>
              <Text style={styles.roleDescription}>
                I need anaesthetists for surgeries and procedures
              </Text>
            </View>
            {selectedRole === "clinic" && (
              <Feather name="check-circle" size={24} color="#0891b2" style={styles.checkIcon} />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedRole && styles.disabledButton,
            selectedRole === "anaesthetist" && styles.anaesthetistButton,
            selectedRole === "clinic" && styles.clinicButton,
          ]}
          onPress={handleRoleSelect}
          disabled={!selectedRole || isLoading}
        >
          <Text style={styles.continueButtonText}>
            {isLoading ? "Processing..." : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f7",
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 24,
    borderRadius: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    maxWidth: 300,
  },
  optionsContainer: {
    marginBottom: 32,
  },
  roleOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  selectedOption: {
    backgroundColor: "#f9fafb",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  selectedIconContainer: {
    backgroundColor: "#4f46e5",
  },
  roleTextContainer: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  checkIcon: {
    marginLeft: 12,
  },
  continueButton: {
    backgroundColor: "#d1d5db",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  anaesthetistButton: {
    backgroundColor: "#4f46e5",
  },
  clinicButton: {
    backgroundColor: "#0891b2",
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});