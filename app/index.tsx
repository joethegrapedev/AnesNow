import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { SplashScreen } from 'expo-router';

export default function Index() {
  const router = useRouter();
  
  useEffect(() => {
    // Hide splash screen and navigate after a delay
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
      router.replace('/loading');
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Return a minimal component (won't be visible due to splash screen)
  return (
    <View>
      <Text>Loading app...</Text>
    </View>
  );
}
