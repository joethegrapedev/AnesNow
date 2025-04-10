import React from 'react'
import {auth} from '@/FirebaseConfig'
import { getAuth } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Touchable } from 'react-native';
import Logout from "../../components/auth/Logout"

export default function SignoutScreen() {
  const router = useRouter();
  getAuth().onAuthStateChanged((user) => {
    if (!user) router.replace('/login');
  });

return(
<View style={styles.container}> 
  
<Logout 
  buttonStyle={{ backgroundColor: 'black' }}
  textStyle={{ color: 'white', fontSize: 18 }}
  buttonText="Log Out" 
  onSuccess={() => {
    // Do something after logout
    console.log('Custom logout action');
    router.replace('/login');
  }}
/>
  
</View>
)}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#E53935',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '80%',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
});