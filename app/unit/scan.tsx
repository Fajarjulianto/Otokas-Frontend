import { GoogleGenerativeAI } from "@google/generative-ai";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Stack, router } from "expo-router";
import {
  ArrowLeft,
  CarFront,
  CheckCircle,
  DollarSign,
  RotateCcw,
  ScanLine,
} from "lucide-react-native";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_KEY;

type OcrResult = {
  nomor_polisi: string;
  merk: string;
  tipe_kode: string;
  tahun: string;
  warna: string;
  berlaku_sampai: string;
  nomor_rangka: string;
  nomor_mesin: string;
};

function formatRupiahInput(raw: string): string {
  const cleaned = raw.replace(/\D/g, "");
  if (!cleaned) return "";
  return Number(cleaned).toLocaleString("id-ID");
}

function parseRupiah(formatted: string): number {
  return Number(formatted.replace(/\./g, ""));
}

function KonfirmasiScreen({
  ocr,
  onBack,
}: {
  ocr: OcrResult;
  onBack: () => void;
}) {
  const [namaPopuler, setNamaPopuler] = useState("");
  const [hargaJual, setHargaJual] = useState("");
  const [hargaBeli, setHargaBeli] = useState("");
  const [platEdit, setPlatEdit] = useState(ocr.nomor_polisi);
  const [tahunEdit, setTahunEdit] = useState(ocr.tahun);

  const buying = parseRupiah(hargaBeli);
  const selling = parseRupiah(hargaJual);
  const margin =
    buying > 0 && selling > 0
      ? (((selling - buying) / buying) * 100).toFixed(1)
      : null;
  const profit = buying > 0 && selling > 0 ? selling - buying : null;

  const isValid = namaPopuler.trim() !== "" && hargaBeli !== "";

  function handleSimpan() {
    if (!isValid) return;
    const dataMotor = {
      brand: ocr.merk,
      name: namaPopuler,
      year: Number(tahunEdit) || undefined,
      buyingPrice: buying,
      sellingPrice: selling || undefined,
      licensePlate: platEdit || undefined,
      roadTaxDueDate: ocr.berlaku_sampai || undefined,
      roadTaxStatus: ocr.berlaku_sampai ? "active" : undefined,
      isIncomplete: false,
    };
    console.log("SIMPAN MOTOR:", dataMotor);
    router.replace("/(tabs)");
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View className="bg-otokas-primary px-5 pt-2 pb-5 flex-row items-center gap-3">
          <TouchableOpacity
            onPress={onBack}
            className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center"
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-white text-xl font-bold">
              Konfirmasi Data
            </Text>
            <Text className="text-blue-200 text-sm mt-0.5">
              Periksa hasil scan, lalu lengkapi
            </Text>
          </View>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 130 }}
        >
          <View
            className="bg-white rounded-2xl p-4 mb-5"
            style={{
              elevation: 2,
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            <Text className="text-slate-500 text-sm font-semibold mb-3">
              📄 Data dari STNK
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {[
                { label: "Merek", value: ocr.merk },
                { label: "Kode Tipe", value: ocr.tipe_kode },
                { label: "Warna", value: ocr.warna },
                { label: "Rangka", value: ocr.nomor_rangka },
                { label: "Mesin", value: ocr.nomor_mesin },
              ]
                .filter((d) => d.value)
                .map((d) => (
                  <View
                    key={d.label}
                    className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl"
                  >
                    <Text className="text-slate-400 text-xs">{d.label}</Text>
                    <Text className="text-slate-700 text-sm font-semibold">
                      {d.value}
                    </Text>
                  </View>
                ))}
            </View>
          </View>

          <View className="flex-row gap-3 mb-5">
            <View className="flex-1">
              <Text className="text-slate-700 font-semibold text-base mb-2">
                Plat Nomor
              </Text>
              <TextInput
                value={platEdit}
                onChangeText={(t) => setPlatEdit(t.toUpperCase())}
                autoCapitalize="characters"
                placeholderTextColor="#94a3b8"
                placeholder="BE 1234 AB"
                className="bg-white border border-slate-200 p-4 rounded-xl text-slate-900 text-base"
              />
            </View>
            <View className="flex-1">
              <Text className="text-slate-700 font-semibold text-base mb-2">
                Tahun
              </Text>
              <TextInput
                value={tahunEdit}
                onChangeText={(t) =>
                  setTahunEdit(t.replace(/\D/g, "").slice(0, 4))
                }
                keyboardType="numeric"
                maxLength={4}
                placeholderTextColor="#94a3b8"
                placeholder="2021"
                className="bg-white border border-slate-200 p-4 rounded-xl text-slate-900 text-base"
              />
            </View>
          </View>

          <View className="mb-5">
            <View className="flex-row items-center gap-2 mb-2">
              <CarFront size={16} color="#475569" />
              <Text className="text-slate-700 font-semibold text-base">
                Nama Motor <Text className="text-red-400">*</Text>
              </Text>
            </View>
            <TextInput
              value={namaPopuler}
              onChangeText={setNamaPopuler}
              placeholder={`Contoh: Beat FI, Mio M3, Vario 125`}
              autoCapitalize="words"
              placeholderTextColor="#94a3b8"
              className="bg-white border border-slate-200 p-4 rounded-xl text-slate-900 text-base"
            />
            <Text className="text-slate-400 text-xs mt-1.5 ml-1">
              Kode STNK: {ocr.tipe_kode || "—"} → tulis nama yang biasa Anda
              pakai
            </Text>
          </View>

          {/* Harga Beli */}
          <View className="mb-5">
            <View className="flex-row items-center gap-2 mb-2">
              <DollarSign size={16} color="#475569" />
              <Text className="text-slate-700 font-semibold text-base">
                Harga Beli <Text className="text-red-400">*</Text>
              </Text>
            </View>
            <View className="relative">
              <Text className="absolute left-4 top-4 text-slate-500 text-base z-10 font-medium">
                Rp
              </Text>
              <TextInput
                value={hargaBeli}
                onChangeText={(t) => setHargaBeli(formatRupiahInput(t))}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#94a3b8"
                className="bg-white border border-slate-200 p-4 pl-12 rounded-xl text-slate-900 text-base"
              />
            </View>
          </View>

          {/* Harga Jual */}
          <View className="mb-2">
            <View className="flex-row items-center gap-2 mb-2">
              <DollarSign size={16} color="#475569" />
              <Text className="text-slate-700 font-semibold text-base">
                Target Harga Jual
              </Text>
            </View>
            <View className="relative">
              <Text className="absolute left-4 top-4 text-slate-500 text-base z-10 font-medium">
                Rp
              </Text>
              <TextInput
                value={hargaJual}
                onChangeText={(t) => setHargaJual(formatRupiahInput(t))}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#94a3b8"
                className="bg-white border border-slate-200 p-4 pl-12 rounded-xl text-slate-900 text-base"
              />
            </View>
          </View>

          {/* Estimasi Margin */}
          {margin !== null && profit !== null && (
            <View className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex-row items-center justify-between mt-4">
              <Text className="text-emerald-700 font-semibold text-base">
                Estimasi Untung
              </Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-emerald-700 text-base font-medium">
                  Rp {profit.toLocaleString("id-ID")}
                </Text>
                <View className="bg-emerald-500 px-2.5 py-1 rounded-lg">
                  <Text className="text-white text-sm font-bold">
                    {margin}%
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Info pajak */}
          {ocr.berlaku_sampai && (
            <View className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex-row items-center gap-3 mt-4">
              <Text className="text-2xl">📋</Text>
              <View>
                <Text className="text-blue-700 font-semibold text-sm">
                  Pajak Terdeteksi
                </Text>
                <Text className="text-blue-600 text-base mt-0.5">
                  Berlaku sampai: {ocr.berlaku_sampai}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Tombol Simpan sticky */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-white px-5 pt-4 pb-8 border-t border-slate-100"
          style={{ elevation: 12 }}
        >
          {!isValid && (
            <Text className="text-slate-400 text-sm text-center mb-3">
              Wajib diisi: Nama Motor dan Harga Beli
            </Text>
          )}
          <TouchableOpacity
            onPress={handleSimpan}
            disabled={!isValid}
            className={`w-full p-4 rounded-2xl flex-row items-center justify-center gap-2 ${
              isValid ? "bg-[#f59e0b]" : "bg-slate-200"
            }`}
          >
            <CheckCircle
              size={22}
              color={isValid ? "white" : "#94a3b8"}
              strokeWidth={2}
            />
            <Text
              className={`text-center font-bold text-lg ${
                isValid ? "text-white" : "text-slate-400"
              }`}
            >
              Simpan Motor
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── MAIN SCAN SCREEN ───
export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingLabel, setProcessingLabel] = useState("");
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cameraRef = useRef<CameraView>(null);

  // ── Izin kamera ──
  if (!permission) return <View className="flex-1 bg-black" />;

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
        <Stack.Screen options={{ headerShown: false }} />
        <ScanLine size={48} color="#1e3a8a" strokeWidth={1.5} />
        <Text className="text-xl font-bold text-slate-800 mt-4 text-center">
          Butuh Akses Kamera
        </Text>
        <Text className="text-slate-400 text-base text-center mt-2 mb-6">
          Otokas perlu kamera untuk scan STNK dan BPKB Anda
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-otokas-primary px-8 py-4 rounded-2xl"
        >
          <Text className="text-white font-bold text-lg">Izinkan Kamera</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Ambil Foto dengan kamera
  const takePicture = async () => {
    if (!cameraRef.current) return;
    setIsProcessing(true);
    setProcessingLabel("Mengambil foto...");
    setErrorMsg(null);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });
      if (photo?.uri && photo?.base64) {
        setPhotoUri(photo.uri);
        setPhotoBase64(photo.base64);
      }
    } catch (e) {
      setErrorMsg((e as Error).message || "Gagal mengambil foto. Coba lagi.");
    } finally {
      setIsProcessing(false);
      setProcessingLabel("");
    }
  };

  const retakePicture = () => {
    setPhotoUri(null);
    setPhotoBase64(null);
    setOcrResult(null);
    setErrorMsg(null);
  };

  // ── OCR via Gemini ──
  const processOCR = async () => {
    if (!photoBase64) return;
    setIsProcessing(true);
    setProcessingLabel("Membaca STNK dengan AI...");
    setErrorMsg(null);

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_KEY as string);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash-latest",
      });

      const prompt = `
        Kamu adalah sistem ekstraksi data STNK/BPKB Indonesia.
        Baca gambar ini dan kembalikan HANYA JSON valid tanpa markdown, tanpa penjelasan.
        Jika field tidak ditemukan, isi dengan string kosong "".
        Format wajib:
        {
          "nomor_polisi": "",
          "merk": "",
          "tipe_kode": "",
          "tahun": "",
          "warna": "",
          "berlaku_sampai": "",
          "nomor_rangka": "",
          "nomor_mesin": ""
        }
      `;

      const result = await model.generateContent([
        prompt,
        { inlineData: { data: photoBase64, mimeType: "image/jpeg" } },
      ]);

      const raw = result.response.text();
      const clean = raw.replace(/```json|```/g, "").trim();
      const data: OcrResult = JSON.parse(clean);
      setOcrResult(data);
    } catch (e) {
      console.error("OCR error:", e);
      setErrorMsg(
        "Gagal membaca STNK. Pastikan foto terang, teks terbaca jelas, lalu coba lagi.",
      );
    } finally {
      setIsProcessing(false);
      setProcessingLabel("");
    }
  };

  // Hasil OCR
  if (ocrResult) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <KonfirmasiScreen ocr={ocrResult} onBack={retakePicture} />
      </>
    );
  }

  // Preview Foto
  if (photoUri) {
    return (
      <View className="flex-1 bg-black">
        <Stack.Screen options={{ headerShown: false }} />
        <Image
          source={{ uri: photoUri }}
          className="flex-1"
          resizeMode="contain"
        />

        {/* Overlay loading AI */}
        {isProcessing && (
          <View className="absolute inset-0 bg-black/70 items-center justify-center">
            <ActivityIndicator size="large" color="#f59e0b" />
            <Text className="text-white text-base font-semibold mt-4">
              {processingLabel}
            </Text>
          </View>
        )}

        {/* Error */}
        {errorMsg && (
          <View className="absolute top-16 left-5 right-5 bg-red-500 rounded-2xl px-4 py-3">
            <Text className="text-white text-sm font-medium">{errorMsg}</Text>
          </View>
        )}

        {/* Panel bawah */}
        {!isProcessing && (
          <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl px-5 pt-5 pb-10">
            <Text className="text-slate-700 font-bold text-base text-center mb-4">
              Foto sudah jelas?
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={retakePicture}
                className="flex-1 border-2 border-slate-200 py-4 rounded-2xl flex-row items-center justify-center gap-2"
              >
                <RotateCcw size={18} color="#64748b" />
                <Text className="text-slate-700 font-bold text-base">
                  Ulangi
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={processOCR}
                className="flex-1 bg-otokas-primary py-4 rounded-2xl flex-row items-center justify-center gap-2"
              >
                <ScanLine size={18} color="white" />
                <Text className="text-white font-bold text-base">
                  Baca STNK
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  }

  // Open Camera
  return (
    <View className="flex-1 bg-black">
      <Stack.Screen options={{ headerShown: false }} />
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back">
        <View className="flex-1 bg-black/50">
          {/* Tombol back */}
          <SafeAreaView edges={["top"]}>
            <View className="flex-row items-center px-5 pt-2">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 bg-black/50 rounded-xl items-center justify-center"
              >
                <ArrowLeft size={20} color="white" />
              </TouchableOpacity>
              <Text className="text-white text-lg font-bold ml-4">
                Scan STNK / BPKB
              </Text>
            </View>
          </SafeAreaView>
          {/*  Bingkai Foto */}
          <View className="flex-1 items-center justify-center">
            <View className="w-80 h-52 relative">
              {/* Border corners */}
              {[
                "absolute -top-1 -left-1 border-t-4 border-l-4",
                "absolute -top-1 -right-1 border-t-4 border-r-4",
                "absolute -bottom-1 -left-1 border-b-4 border-l-4",
                "absolute -bottom-1 -right-1 border-b-4 border-r-4",
              ].map((cls, i) => (
                <View key={i} className={`${cls} w-8 h-8 border-amber-400`} />
              ))}
            </View>
            <Text className="text-white text-sm mt-5 font-medium opacity-80">
              Arahkan kamera ke STNK atau BPKB
            </Text>
            <Text className="text-amber-300 text-xs mt-1 opacity-70">
              Pastikan teks terbaca jelas & cahaya cukup
            </Text>
          </View>

          {/* Tombol Shutter */}
          <View className="items-center pb-14">
            <TouchableOpacity
              onPress={takePicture}
              disabled={isProcessing}
              className="w-20 h-20 bg-white rounded-full border-4 border-amber-400 items-center justify-center"
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#1e3a8a" />
              ) : (
                <View className="w-14 h-14 bg-otokas-primary rounded-full" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}
