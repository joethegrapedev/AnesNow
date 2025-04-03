import { Text, View, SafeAreaView, TextInput, TouchableOpacity} from "react-native";
import {auth} from "../FirebaseConfig";
import { createUserWithEmailAndPassword,signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import{ useRouter } from "expo-router";

export default function Index() {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const router = useRouter();
const SignIn= async() =>{
  try {
    const user = await signInWithEmailAndPassword(auth,email,password);
    if (user) router.replace('/(tabs)')
  }
  catch (error:any) {
    console.log("Error signing in: ", error)
    alert("Sign in failed" +error.message);
  }
}

const SignUp= async() => {
  try {
    const user = await createUserWithEmailAndPassword(auth,email,password);
    if (user) router.replace('/(tabs)')
  }
  catch (error:any) {
    console.log("Error signing in: ", error)
    alert("Sign in failed" +error.message);
  }
}



  return (
    <View>
      <SafeAreaView>
<Text>Welcome to Anaesthesia Now</Text>
<TextInput placeholder="email" value = {email} onChangeText= {setemail}/>
<TextInput placeholder="password" value = {password} onChangeText= {setpassword}/>
      
      <TouchableOpacity onPress={SignIn}>
        <Text> Login </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={SignUp}>
        <Text> Sign up </Text>
      </TouchableOpacity>
      
      </SafeAreaView>
    </View>
  );
}
