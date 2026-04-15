// import { useAuthContext } from "@/src/context/authContext";
// import { Redirect } from "expo-router";
// import { ActivityIndicator, View } from "react-native";

// export default function Index() {
//   const { session, isLoading } = useAuthContext();

//   if (isLoading) {
//     return (
//       <View className="flex-1 items-center justify-center bg-otokas-primary">
//         <ActivityIndicator color="white" size="large" />
//       </View>
//     );
//   }

//   return session ? (
//     <Redirect href="/(tabs)" />
//   ) : (
//     <Redirect href="/(auth)/login" />
//   );
// }

import { Redirect } from "expo-router";

export default function Index() {
  const isLoggedIn = true; //useAuthContext()

  return isLoggedIn ? (
    <Redirect href="/(tabs)" />
  ) : (
    <Redirect href="/(auth)/login" />
  );
}
