"use client"
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native"
import { useRouter } from "expo-router"
import { Feather } from "@expo/vector-icons"

export default function LoginCard() {
  const router = useRouter()
// ADD MY COMPANY LOGO LATER ON
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.logoContainer}>
          <Image source={{ uri: "/placeholder.svg?height=80&width=80" }} style={styles.logo} />
        </View>

        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Please select your role to continue</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => router.push("/auth/ClinicAuth")}>
            <View style={styles.buttonContent}>
              <Feather name="home" size={24} color="#ffffff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Sign in as Clinic</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.push("/auth/AnaesthetistAuth")}
          >
            <View style={styles.buttonContent}>
              <Feather name="user" size={24} color="#ffffff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Sign in as Anaesthetist</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.helpText}>Need help? Contact support</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f7",
  },
  card: {
    width: "100%",
    maxWidth: 400,
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
    marginBottom: 32,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    backgroundColor: "#4f46e5",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  secondaryButton: {
    backgroundColor: "#0891b2",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  helpText: {
    marginTop: 24,
    textAlign: "center",
    color: "#666666",
    fontSize: 14,
  },
})