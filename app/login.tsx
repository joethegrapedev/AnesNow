import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { auth, db } from "../FirebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignIn, setIsSignIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userRole, setUserRole] = useState<"anaesthetist" | "clinic" | null>(null);
  const [staySignedIn, setStaySignedIn] = useState(true); // Default to true for better UX
  const router = useRouter();

  // Load the saved role from AsyncStorage when the component mounts
  useEffect(() => {
    const getSavedRole = async () => {
      try {
        const savedRole = await AsyncStorage.getItem("userRole");
        if (savedRole === "anaesthetist" || savedRole === "clinic") {
          setUserRole(savedRole);
        } else {
          // If no role is saved, redirect to role selection
          router.replace("/Roleselection");
        }
      } catch (error) {
        console.error("Error retrieving saved role:", error);
      }
    };

    getSavedRole();
  }, []);

  const handleAuth = async () => {
    if (!userRole) {
      router.replace("/Roleselection");
      return;
    }

    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      // Remove the web-specific setPersistence call
      // We'll handle persistence with AsyncStorage instead

      let userCredential;
      if (isSignIn) {
        // Sign In
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Sign Up
        userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Create user document in Firestore with the selected role
        const userDocRef = doc(db, "users", userCredential.user.uid);
        await setDoc(userDocRef, {
          email: userCredential.user.email,
          role: userRole,
          createdAt: new Date(),
          name: "",
          phone: "",
          profileImage: "https://cdn-icons-png.flaticon.com/512/6522/6522516.png",
          isProfileComplete: false
        });

        // Save the "stay signed in" preference
        await AsyncStorage.setItem("staySignedIn", staySignedIn ? "true" : "false");
        
        // For new sign-ups, redirect to Details page to complete profile
        router.replace("/(setup)/Details");
        return;
      }

      // Save the "stay signed in" preference
      await AsyncStorage.setItem("staySignedIn", staySignedIn ? "true" : "false");
      
      // Save the user auth data for custom persistence management
      if (staySignedIn) {
        // Store auth data for persistent sessions
        await AsyncStorage.setItem("authUser", JSON.stringify({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
        }));
      } else {
        // Clear any existing persistent auth data
        await AsyncStorage.removeItem("authUser");
      }

      if (isSignIn) {
        // Check if user document exists and has a role
        const userDocRef = doc(db, "users", userCredential.user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Verify that the user has the correct role
          if (userData.role === userRole) {
            // Check if profile is complete
            if (userData.isProfileComplete === true) {
              router.replace("/(Personal)/Dashboard");
            } else {
              // Profile not complete, redirect to Details page
              router.replace("/(setup)/Details");
            }
          } else {
            // Role mismatch - user is trying to log in with a different role
            alert(`This account is registered as ${userData.role}. Please select the correct role.`);
            await auth.signOut();
            router.replace("/Roleselection");
          }
        } else {
          // User exists in Auth but not in Firestore, create their document
          await setDoc(userDocRef, {
            email: userCredential.user.email,
            role: userRole,
            createdAt: new Date(),
            name: "",
            phone: "",
            profileImage: "https://cdn-icons-png.flaticon.com/512/6522/6522516.png",
            isProfileComplete: false
          });
          // Redirect to Details page to complete profile
          router.replace("/(setup)/Details");
        }
      }
    } catch (error: any) {
      console.log(`Error ${isSignIn ? "signing in" : "signing up"}: `, error);
      alert(`${isSignIn ? "Sign in" : "Sign up"} failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignIn(!isSignIn);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoid}>
        <View style={styles.card}>
          <View style={styles.logoContainer}>
            <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/6522/6522516.png" }} style={styles.logo} />
          </View>

          <Text style={styles.title}>Anaesthesia Now</Text>
          <Text style={styles.subtitle}>
            {isSignIn ? "Sign in as " : "Create an account as "}
            <Text style={userRole === "anaesthetist" ? styles.anaesthetistText : styles.clinicText}>
              {userRole === "anaesthetist" ? "Anaesthetist" : "Clinic"}
            </Text>
          </Text>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Feather name="mail" size={20} color="#666666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Feather name="lock" size={20} color="#666666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Feather 
                  name={showPassword ? "eye" : "eye-off"} 
                  size={20} 
                  color="#666666" 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.staySignedInContainer}>
              <TouchableOpacity 
                style={styles.checkbox}
                onPress={() => setStaySignedIn(!staySignedIn)}
              >
                {staySignedIn ? (
                  <View style={styles.checkedBox}>
                    <Feather name="check" size={14} color="#ffffff" />
                  </View>
                ) : (
                  <View style={styles.uncheckedBox} />
                )}
              </TouchableOpacity>
              <Text style={styles.staySignedInText}>Stay signed in</Text>
            </View>

            {isSignIn && (
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[
                styles.button, 
                userRole === "anaesthetist" ? styles.anaesthetistButton : styles.clinicButton
              ]} 
              onPress={handleAuth} 
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>{isSignIn ? "Sign In" : "Sign Up"}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>{isSignIn ? "Don't have an account?" : "Already have an account?"}</Text>
              <TouchableOpacity onPress={toggleAuthMode}>
                <Text style={styles.toggleLink}>{isSignIn ? "Sign Up" : "Sign In"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={() => router.push("/Roleselection")}>
            <View style={styles.backButton}>
              <Feather name="refresh-cw" size={20} color="#666666" />
              <Text style={styles.backButtonText}>Change role</Text>
            </View>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f7",
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333333",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 24,
  },
  anaesthetistText: {
    color: "#4f46e5",
    fontWeight: "600",
  },
  clinicText: {
    color: "#0891b2",
    fontWeight: "600",
  },
  formContainer: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e2e2",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333333",
  },
  forgotPassword: {
    alignSelf: "flex-end",
  },
  forgotPasswordText: {
    color: "#4f46e5",
    fontSize: 14,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  anaesthetistButton: {
    backgroundColor: "#4f46e5",
  },
  clinicButton: {
    backgroundColor: "#0891b2",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  toggleText: {
    color: "#666666",
    fontSize: 14,
  },
  toggleLink: {
    color: "#4f46e5",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 5,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  backButtonText: {
    color: "#666666",
    fontSize: 14,
    marginLeft: 8,
  },
  eyeIcon: {
    padding: 5,
    marginLeft: 5,
  },
  staySignedInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkbox: {
    marginRight: 8,
  },
  uncheckedBox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
  },
  checkedBox: {
    width: 20,
    height: 20,
    backgroundColor: '#4f46e5',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  staySignedInText: {
    color: '#6b7280',
    fontSize: 14,
  },
});

