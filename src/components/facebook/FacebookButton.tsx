import { FACEBOOK_ENABLED } from "@/src/services/facebookServices";
import { router } from "expo-router";
import { Text, TouchableOpacity } from "react-native";
export function FacebookButton({ motorId }: { motorId?: string }) {
  if (!FACEBOOK_ENABLED) return null;
  return (
    <TouchableOpacity
      className="bg-blue-50 border border-blue-200 rounded-xl p-4 my-3"
      onPress={() =>
        motorId
          ? router.push({ pathname: "/facebook-post", params: { id: motorId } })
          : router.push("/facebook")
      }
    >
      <Text className="text-blue-800 font-bold">
        {motorId ? "Siapkan Posting Facebook" : "Hubungkan Facebook Page"}
      </Text>
    </TouchableOpacity>
  );
}
