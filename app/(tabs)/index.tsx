import React from 'react'
import {auth} from '@/FirebaseConfig'
import { getAuth } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Touchable } from 'react-native';

export default function SignoutScreen() {
  const router = useRouter();
  getAuth().onAuthStateChanged((user) => {
    if (!user) router.replace('/');
  });

return(
<View style={styles.container}> 
  
    <TouchableOpacity
      onPress={() => {
        auth.signOut()
          .then(() => {
            console.log('User signed out');
          })
          .catch((error) => {
            console.error('Error signing out:', error);
          });
      }}
      style={styles.button}
    >
      <Text>Sign Out</Text>
      </TouchableOpacity>
  
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