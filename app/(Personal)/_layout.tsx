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
          headerShown: false, // Hide headers for all tabs
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color }) => <Home width={22} height={22} stroke={color} />,
            href: "/Dashboard", 
            
          }}
        />
        <Tabs.Screen
          name="My-jobs"
          options={{
            title: "My-Jobs",
            tabBarIcon: ({ color }) => <Briefcase width={22} height={22} stroke={color} />,
            href: "/My-jobs", // Explicitly set the route
            
          }}
        />
        <Tabs.Screen
          name="Profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => <User width={22} height={22} stroke={color} />,
            href: "/Profile", // Explicitly set the route
            
          }}
        />
      </Tabs>
    </AuthProvider>
  )
}

