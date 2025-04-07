import { Tabs } from "expo-router"
import { Home, Briefcase, User } from "react-native-feather"
import AuthProvider from "../../components/auth/AuthProvider"

export default function AnaesthetistLayout() {
  return (
    <AuthProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#4f46e5",
          tabBarInactiveTintColor: "#6b7280",
          tabBarStyle: {
            backgroundColor: "#ffffff",
            borderTopWidth: 1,
            borderTopColor: "#e5e7eb",
            paddingTop: 5,
            paddingBottom: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
            marginBottom: 5,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="ClinicDashboard" // Case matters! Must match file name
          options={{
            title: "ClinicDashboard", // This is the displayed text
            tabBarIcon: ({ color }) => <Home width={22} height={22} stroke={color} />,
          }}
        />
        <Tabs.Screen
          name="My-jobs" // Case matters! Must match file name
          options={{
            title: "ListJob", // This is the displayed text (space added)
            tabBarIcon: ({ color }) => <Briefcase width={22} height={22} stroke={color} />,
          }}
        />
        <Tabs.Screen
          name="Profile" // Case matters! Must match file name
          options={{
            title: "ClinicProfile", // This is the displayed text
            tabBarIcon: ({ color }) => <User width={22} height={22} stroke={color} />,
          }}
        />
      </Tabs>
    </AuthProvider>
  )
}

