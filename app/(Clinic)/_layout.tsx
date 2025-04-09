import { Tabs } from "expo-router"
import { Home, Briefcase, User } from "react-native-feather"
import AuthProvider from "../../components/auth/AuthProvider"

// Change function name from AnaesthetistLayout to ClinicLayout
export default function ClinicLayout() {
  return (
    <AuthProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#0891b2", // Change to cyan for clinics
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
            title: "Dashboard", // This is the displayed text
            tabBarIcon: ({ color }) => <Home width={22} height={22} stroke={color} />,
          }}
        />
        <Tabs.Screen
          name="CreateJobs" // Fix this to match file name
          options={{
            title: "Create Jobs", // This is the displayed text (space added)
            tabBarIcon: ({ color }) => <Briefcase width={22} height={22} stroke={color} />,
          }}
        />
        <Tabs.Screen
          name="Profile" // Case matters! Must match file name
          options={{
            title: "Profile", // This is the displayed text
            tabBarIcon: ({ color }) => <User width={22} height={22} stroke={color} />,
          }}
        />
      </Tabs>
    </AuthProvider>
  )
}

