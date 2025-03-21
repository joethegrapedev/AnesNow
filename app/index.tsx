import { Text, View } from "react-native";
import LoginCard from "@/auth/LoginCard";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      
      <LoginCard />
    </View>
  );
}
