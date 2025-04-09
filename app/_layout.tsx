import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SplashScreen } from 'expo-router';
import { useEffect } from 'react';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Add some debug logging when the app initializes

export default function Layout() {
  useEffect(() => {
    console.log("App layout initialized");
    
    // Check the routes registered
    console.log("Routes registered:");
    // We can't actually see the routes, but this will show that the layout loaded
  }, []);

  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="loading" options={{ headerShown: false }} />
        <Stack.Screen name="(setup)" options={{ headerShown: false }} />
        <Stack.Screen name="(Personal)" options={{ headerShown: false }} />
        <Stack.Screen name="(Clinic)" options={{ headerShown: false }} />
        <Stack.Screen name="Roleselection" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
