import { StartupPermissionScreen } from "@/src/components/startup/StartupPermissionScreen";
import { useAuthContext } from "@/src/context/authContext";
import { useStartupPermissions } from "@/src/hooks/useStartupPermissions";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { user, isLoading } = useAuthContext();
  const {
    isChecking,
    isCompleted,
    isRequesting,
    error,
    requestPermissions,
    skipPermissions,
  } = useStartupPermissions();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-otokas-primary">
        <ActivityIndicator color="white" size="large" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (isChecking) {
    return (
      <View className="flex-1 items-center justify-center bg-otokas-primary">
        <ActivityIndicator color="white" size="large" />
      </View>
    );
  }

  if (!isCompleted) {
    return (
      <StartupPermissionScreen
        isRequesting={isRequesting}
        error={error}
        onContinue={requestPermissions}
        onSkip={skipPermissions}
      />
    );
  }

  return <Redirect href="/(tabs)" />;
}
