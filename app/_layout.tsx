import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import "../global.css";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import { AuthProvider } from "../src/context/authContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 menit
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
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
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
