import { AccountQueries } from "@/src/components/providers/AccountQueries";
import { Stack } from "expo-router";
import "../global.css";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import { AuthProvider } from "../src/context/authContext";

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AccountQueries>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="unit/[id]/edit" />
            <Stack.Screen
              name="unit/scan"
              options={{ presentation: "modal" }}
            />
            <Stack.Screen name="paket" />
            <Stack.Screen name="payment/checkout" />
            <Stack.Screen name="payment/webview" />
            <Stack.Screen name="payment/result" />
          </Stack>
        </AccountQueries>
      </AuthProvider>
    </ErrorBoundary>
  );
}
