import { CameraView, useCameraPermissions } from "expo-camera";
import { Stack, router } from "expo-router";
import { ArrowLeft, RotateCcw } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// API Services
import {
  getUploadUrls,
  scanWithUploadedPaths,
  uploadFileToGCS,
} from "@/src/services/motorServices";

import ReviewScreen from "@/src/components/scan/ReviewScreen";
import CameraPermissionScreen from "@/src/components/scan/CameraPermissionScreen";
import ScreenConfirmation from "@/src/components/scan/screenConfirmation";
import Viewfinder from "@/src/components/scan/viewFinder";
import { OcrResult, PhotoItem } from "@/src/types/scan";
import {
  prepareImageForUpload,
  type PreparedWebPImage,
  WEBP_MIME_TYPE,
} from "@/src/utils/imageUpload";

const MAX_PHOTOS = 10;

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingLabel, setProcessingLabel] = useState("");
  const [ocrResults, setOcrResults] = useState<OcrResult[]>([]);
  const [activeScanIndex, setActiveScanIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [flashFeedback, setFlashFeedback] = useState(false);

  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    const onHardwareBack = () => {
      if (photos.length > 0) {
        Alert.alert(
          "Yakin ingin keluar?",
          `${photos.length} foto yang sudah diambil akan hilang.`,
          [
            { text: "Tidak", style: "cancel" },
            {
              text: "Keluar",
              style: "destructive",
              onPress: () => router.back(),
            },
          ],
        );
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener(
      "hardwareBackPress",
      onHardwareBack,
    );
    return () => sub.remove();
  }, [photos.length]);

  if (!permission) return <View className="flex-1 bg-black" />;
  if (!permission.granted)
    return <CameraPermissionScreen onRequestPermission={requestPermission} />;

  const takeRapidPhoto = async () => {
    if (!cameraRef.current || isProcessing || photos.length >= MAX_PHOTOS)
      return;
    setErrorMsg(null);
    setFlashFeedback(true);
    setTimeout(() => setFlashFeedback(false), 150);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 1 });
      if (photo?.uri) {
        setPhotos((prev) => [
          ...prev,
          { uri: photo.uri, width: photo.width, height: photo.height },
        ]);
      }
    } catch (e) {
      console.error("[ScanScreen] Gagal mengambil foto:", e);
      setErrorMsg((e as Error).message || "Gagal mengambil foto.");
    }
  };

  const processPhotoOCR = async (indices: number[]) => {
    const selectedPhotos = indices
      .map((i) => photos[i])
      .filter((p): p is PhotoItem => !!p?.uri);

    if (selectedPhotos.length === 0) return;
    setIsProcessing(true);
    setErrorMsg(null);
    let failedStep = "menyiapkan upload";

    try {
      setProcessingLabel(`Menyiapkan upload ${selectedPhotos.length} foto...`);

      const preparedPhotos: PreparedWebPImage[] = [];
      for (let i = 0; i < selectedPhotos.length; i += 1) {
        preparedPhotos.push(
          await prepareImageForUpload(selectedPhotos[i], {
            compress: 0.82,
            maxWidth: 2048,
            fallbackName: `stnk-scan-${Date.now()}-${i}`,
          }),
        );
      }

      // 1. Susun payload sesuai RequestUploadUrlsDto backend
      const uploadPayload = preparedPhotos.map(({ fileName, mimeType }) => ({
        fileName,
        mimeType,
      }));
      const uploadItems = await getUploadUrls(uploadPayload);

      if (
        uploadItems.length !== selectedPhotos.length ||
        uploadItems.some((item) => !item?.uploadUrl || !item.filePath)
      ) {
        throw new Error(
          "Server tidak mengembalikan URL upload STNK yang lengkap.",
        );
      }

      failedStep = "mengupload foto";
      setProcessingLabel(`Mengupload foto...`);
      // 2. Upload ke GCS memakai URL dari backend
      await Promise.all(
        preparedPhotos.map((photo, i) =>
          uploadFileToGCS(uploadItems[i].uploadUrl, photo.uri, photo.mimeType),
        ),
      );

      failedStep = "membaca STNK dengan AI";
      setProcessingLabel("Membaca STNK dengan AI...");
      const scanPayload = uploadItems.map((item) => ({
        filePath: item.filePath,
        mimeType: WEBP_MIME_TYPE,
      }));
      const results = await scanWithUploadedPaths(scanPayload);
      const resultsArray = Array.isArray(results) ? results : [results];
      const validResults = resultsArray.filter(
        (r): r is OcrResult =>
          !!r && (!!r.plateNumber || !!r.frameNumber || !!r.brand),
      );

      if (validResults.length === 0) {
        throw new Error(
          "Foto yang Anda jepret bukan STNK yang valid, silakan foto ulang.",
        );
      }

      if (validResults.length > 1) {
        setPhotos([]);
        setIsReviewing(false);
        router.replace({
          pathname: "/motor/batch-tambah",
          params: { scanResults: JSON.stringify(validResults) },
        });
        return;
      }

      setOcrResults(validResults);
      setActiveScanIndex(0);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      console.error(`[ScanScreen] Gagal saat ${failedStep}:`, e);

      if (
        msg.toLowerCase().includes("premium") ||
        msg.toLowerCase().includes("subscription")
      ) {
        setErrorMsg(null);
        Alert.alert(
          "Akses Terbatas",
          "Fitur Scan AI khusus untuk pengguna Premium. Silakan upgrade paket Anda untuk menikmati kemudahan ini.",
          [
            { text: "Nanti Saja", style: "cancel" },
            {
              text: "Upgrade Sekarang",
              onPress: () => {
                setIsReviewing(false);
                setPhotos([]);
                router.push("/paket");
              },
            },
          ],
        );
      } else {
        setErrorMsg(
          msg.toLowerCase().includes("network")
            ? `Koneksi terputus saat ${failedStep}. Periksa internet lalu coba lagi.`
            : msg ||
                "Gagal memproses foto. Pastikan foto terang dan coba lagi.",
        );
      }
    } finally {
      setIsProcessing(false);
      setProcessingLabel("");
    }
  };

  const handleBack = () => {
    if (photos.length > 0) {
      Alert.alert(
        "Yakin ingin keluar?",
        `${photos.length} foto yang sudah diambil akan hilang.`,
        [
          { text: "Tidak", style: "cancel" },
          {
            text: "Keluar",
            style: "destructive",
            onPress: () => router.back(),
          },
        ],
      );
    } else {
      router.back();
    }
  };

  if (ocrResults.length > 0) {
    const currentResult = ocrResults[activeScanIndex];
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenConfirmation
          ocr={currentResult}
          currentIndex={activeScanIndex + 1}
          totalCount={ocrResults.length}
          onBack={() => {
            if (activeScanIndex > 0) {
              setActiveScanIndex(activeScanIndex - 1);
            } else {
              setPhotos([]);
              setIsReviewing(false);
              setOcrResults([]);
              setErrorMsg(null);
            }
          }}
          onSuccessNext={() => {
            if (activeScanIndex < ocrResults.length - 1) {
              setActiveScanIndex(activeScanIndex + 1);
            } else {
              setPhotos([]);
              setIsReviewing(false);
              setOcrResults([]);
              setErrorMsg(null);
              router.replace("/(tabs)/stok");
            }
          }}
        />
      </>
    );
  }

  if (isReviewing && photos.length > 0)
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <ReviewScreen
          photos={photos}
          onBack={() => setIsReviewing(false)}
          onRemove={(idx) => setPhotos((p) => p.filter((_, i) => i !== idx))}
          onClearAll={() => {
            setPhotos([]);
            setIsReviewing(false);
          }}
          onSelectAndProcess={processPhotoOCR}
          isProcessing={isProcessing}
          processingLabel={processingLabel}
          errorMsg={errorMsg}
          maxPhotos={MAX_PHOTOS}
        />
      </>
    );

  return (
    <View className="flex-1 bg-black">
      <Stack.Screen options={{ headerShown: false }} />
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
      />

      <View
        style={StyleSheet.absoluteFill}
        className="z-10 flex-1 justify-between"
      >
        {flashFeedback && (
          <View
            className="absolute inset-0 bg-white z-50 opacity-30"
            pointerEvents="none"
          />
        )}

        {/* Top Bar */}
        <SafeAreaView edges={["top"]}>
          <View className="flex-row items-center px-5 pt-2">
            <TouchableOpacity
              onPress={handleBack}
              className="w-10 h-10 bg-black/50 rounded-xl items-center justify-center"
            >
              <ArrowLeft size={20} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-lg font-bold ml-4">
              Rapid Scan
            </Text>
            {photos.length > 0 && (
              <View className="ml-2 bg-amber-400 px-2.5 py-0.5 rounded-full">
                <Text className="text-black text-sm font-bold">
                  {photos.length}
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>

        <Viewfinder photos={photos} onReview={() => setIsReviewing(true)} />

        {/* Error Message Floating */}
        {errorMsg && (
          <View className="absolute top-28 left-5 right-5 bg-red-500 rounded-2xl px-4 py-3 z-40 shadow-lg">
            <Text className="text-white text-sm font-medium leading-5">
              {errorMsg}
            </Text>
          </View>
        )}
        <View className="flex-row items-center justify-center px-8 pb-14 gap-6">
          <TouchableOpacity
            onPress={handleBack}
            className="w-12 h-12 bg-black/50 rounded-full items-center justify-center"
          >
            <RotateCcw size={22} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={takeRapidPhoto}
            disabled={photos.length >= MAX_PHOTOS}
            className="w-20 h-20 bg-white rounded-full border-4 border-amber-400 items-center justify-center"
          >
            <View className="w-14 h-14 bg-otokas-primary rounded-full" />
          </TouchableOpacity>

          {photos.length > 0 ? (
            <TouchableOpacity
              onPress={() => setIsReviewing(true)}
              className="bg-amber-400 px-4 py-3 rounded-2xl"
            >
              <Text className="text-black font-bold text-sm">Selesai</Text>
            </TouchableOpacity>
          ) : (
            <View className="w-12 h-12" />
          )}
        </View>
      </View>
    </View>
  );
}
