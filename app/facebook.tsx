import { router } from "expo-router";
import { ScreenHeader } from "@/src/components/layout/ScreenHeader";
import { useSubscriptionStatus } from "@/src/hooks/useSubscription";
import {
  FACEBOOK_ENABLED,
  facebookServices,
} from "@/src/services/facebookServices";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function FacebookSettings() {
  const client = useQueryClient();
  const { data: subscription } = useSubscriptionStatus();
  const status = useQuery({
    queryKey: ["facebook", "status"],
    queryFn: facebookServices.status,
    enabled: FACEBOOK_ENABLED,
    staleTime: 0,
  });
  const pages = useQuery({
    queryKey: ["facebook", "pages"],
    queryFn: facebookServices.pages,
    enabled:
      FACEBOOK_ENABLED && !!status.data?.connected && !!subscription?.isPremium,
    retry: false,
  });
  const [busy, setBusy] = useState(false);
  const action = async (work: () => Promise<unknown>) => {
    if (busy) return;
    setBusy(true);
    try {
      await work();
      await client.invalidateQueries({ queryKey: ["facebook"] });
    } catch (e) {
      Alert.alert(
        "Facebook",
        e instanceof Error ? e.message : "Tidak dapat menghubungkan Facebook.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScreenHeader title="Facebook Page" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {!FACEBOOK_ENABLED || status.data?.enabled === false ? (
          <Text>Fitur Facebook belum tersedia.</Text>
        ) : (
          <>
            <Text className="text-slate-700 mb-4">
              Hubungkan Page showroom untuk meninjau caption dan memposting
              motor.
            </Text>
            {(status.isLoading || busy) && <ActivityIndicator />}
            {status.error && <Text>{status.error.message}</Text>}
            <Text className="font-bold mb-4">
              {status.data?.pageName ?? "Belum ada Page terpilih"}
            </Text>
            {status.data?.needsReconnect && (
              <Text>Hubungkan ulang untuk melanjutkan.</Text>
            )}
            {subscription?.isPremium ? (
              <TouchableOpacity
                disabled={busy}
                className="bg-blue-800 rounded-xl p-4 mb-4"
                onPress={() =>
                  void action(async () => {
                    const { url } = await facebookServices.start();
                    await WebBrowser.openAuthSessionAsync(
                      url,
                      "otokas://facebook",
                    );
                  })
                }
              >
                <Text className="text-white font-bold">
                  {status.data?.connected
                    ? "Hubungkan Ulang Facebook"
                    : "Hubungkan Facebook"}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text>Fitur posting membutuhkan Premium aktif.</Text>
            )}
            {pages.error && <Text>{pages.error.message}</Text>}
            {pages.data?.length === 0 && (
              <Text>
                Tidak ada Page yang dapat dikelola. Pastikan akun Facebook
                memiliki akses membuat konten Page.
              </Text>
            )}
            {pages.data?.map((page) => (
              <TouchableOpacity
                disabled={busy}
                key={page.id}
                className="p-4 border border-slate-200 rounded-xl mb-2"
                onPress={() =>
                  void action(() => facebookServices.selectPage(page.id))
                }
              >
                <Text>
                  {page.name}
                  {status.data?.pageId === page.id ? " ✓" : ""}
                </Text>
              </TouchableOpacity>
            ))}
            {status.data?.connected && (
              <TouchableOpacity
                disabled={busy}
                className="p-4 mt-4"
                onPress={() => void action(() => facebookServices.disconnect())}
              >
                <Text className="text-red-700">Putuskan Koneksi</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
