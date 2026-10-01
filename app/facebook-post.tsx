import { ScreenHeader } from "@/src/components/layout/ScreenHeader";
import { useSubscriptionStatus } from "@/src/hooks/useSubscription";
import {
  FACEBOOK_ENABLED,
  facebookServices,
  type FacebookDraft,
} from "@/src/services/facebookServices";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Image,
  Linking,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const messages: Record<string, string> = {
  DRAFT: "Siap ditinjau",
  QUEUED: "Menunggu pengiriman",
  PUBLISHING: "Sedang memposting",
  PUBLISHED: "Berhasil diposting",
  FAILED: "Gagal memposting. Periksa koneksi Page lalu coba lagi.",
  UNKNOWN:
    "Hasil pengiriman belum pasti. Periksa Page Facebook; pengiriman ulang diblokir untuk mencegah duplikat.",
};
export default function FacebookPost() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: subscription } = useSubscriptionStatus();
  const [draft, setDraft] = useState<FacebookDraft | null>(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const sending = useRef(false);
  const loadedDraftId = useRef<string | null>(null);
  useFocusEffect(
    React.useCallback(() => {
      if (!FACEBOOK_ENABLED || !id) return;
      let active = true;
      void facebookServices
        .draft(id)
        .then((data) => {
          if (active) {
            setDraft(data);
            if (loadedDraftId.current !== data.id) setCaption(data.caption);
            loadedDraftId.current = data.id;
            setError("");
          }
        })
        .catch((e: Error) => {
          if (active) setError(e.message);
        });
      return () => {
        active = false;
      };
    }, [id]),
  );
  const postState = draft?.status;
  const publicationId = draft?.id;
  useEffect(() => {
    if (
      !publicationId ||
      !postState ||
      !["QUEUED", "PUBLISHING", "UNKNOWN"].includes(postState)
    )
      return;
    let active = true;
    const refresh = () => {
      if (AppState.currentState !== "active") return;
      void facebookServices
        .postStatus(id, publicationId)
        .then((result) => {
          if (active && result)
            setDraft((old) => (old ? { ...old, ...result } : old));
        })
        .catch(() => {});
    };
    const timer = setInterval(refresh, 4000);
    const listener = AppState.addEventListener("change", refresh);
    return () => {
      active = false;
      clearInterval(timer);
      listener.remove();
    };
  }, [id, postState, publicationId]);
  const post = async () => {
    if (!draft || sending.current) return;
    sending.current = true;
    setBusy(true);
    try {
      const result = await facebookServices.publish(id, draft.id, caption);
      setDraft({ ...draft, status: result.status });
    } catch (e) {
      Alert.alert(
        "Facebook",
        e instanceof Error
          ? e.message
          : "Pengiriman gagal. Cek status sebelum mencoba lagi.",
      );
    } finally {
      sending.current = false;
      setBusy(false);
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScreenHeader
        title="Review Posting Facebook"
        onBack={() => router.back()}
      />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {!FACEBOOK_ENABLED ? (
          <Text>Fitur belum tersedia.</Text>
        ) : (
          <>
            {!!error && <Text className="text-red-700 mb-4">{error}</Text>}
            <TouchableOpacity onPress={() => router.push("/facebook")}>
              <Text className="text-blue-800 mb-4">
                Pengaturan Facebook Page
              </Text>
            </TouchableOpacity>
            {!draft && !error && <ActivityIndicator />}
            {draft && (
              <>
                <Text className="font-bold mb-3">Page: {draft.pageName}</Text>
                <Image
                  source={{ uri: draft.imageUrl }}
                  style={{
                    width: "100%",
                    aspectRatio: 1200 / 630,
                    borderRadius: 12,
                  }}
                  resizeMode="contain"
                />
                <Text className="text-slate-500 text-xs mt-2 mb-4">
                  Perkiraan preview banner. Tampilan akhir mengikuti Facebook.
                </Text>
                <TextInput
                  multiline
                  value={caption}
                  onChangeText={setCaption}
                  maxLength={5000}
                  editable={!busy && ["DRAFT", "FAILED"].includes(draft.status)}
                  style={{
                    minHeight: 180,
                    textAlignVertical: "top",
                    borderWidth: 1,
                    borderColor: "#cbd5e1",
                    padding: 14,
                    borderRadius: 12,
                  }}
                />
                <Text className="text-slate-500 my-3">{draft.link}</Text>
                <Text className="font-semibold mb-3">
                  {messages[draft.status] ?? draft.status}
                </Text>
                {draft.errorCode === "RECONNECT" && (
                  <Text>Token tidak berlaku. Hubungkan ulang Facebook.</Text>
                )}
                {["DRAFT", "FAILED"].includes(draft.status) && (
                  <TouchableOpacity
                    disabled={
                      busy || !subscription?.isPremium || !caption.trim()
                    }
                    className="bg-blue-800 rounded-xl p-4"
                    onPress={() => void post()}
                  >
                    <Text className="text-white text-center font-bold">
                      {busy ? "Mengirim…" : "Posting ke Facebook"}
                    </Text>
                  </TouchableOpacity>
                )}
                {draft.facebookPostId && (
                  <TouchableOpacity
                    className="p-4"
                    onPress={() =>
                      void Linking.openURL(
                        `https://www.facebook.com/${draft.facebookPostId}`,
                      ).catch(() =>
                        Alert.alert("Facebook", "Posting tidak dapat dibuka."),
                      )
                    }
                  >
                    <Text className="text-blue-800">Lihat Posting</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
