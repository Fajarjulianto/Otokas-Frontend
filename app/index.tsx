import { useAuthContext } from "@/src/context/authContext";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-otokas-primary">
        <ActivityIndicator color="white" size="large" />
      </View>
    );
  }

  return user ? <Redirect href="/(tabs)" /> : <Redirect href="/(auth)/login" />;
}
