import { CatalogTemplatePreview } from "@/src/components/website/TemplatePreview";
import {
    DEFAULT_MOTOR_DISPLAY,
    DEFAULT_WEBSITE_TEMPLATE,
    WEBSITE_TEMPLATES,
    WEBSITE_THEME_COLORS,
    type WebsiteTemplate,
} from "@/src/constants/website";
import { useAuthContext } from "@/src/context/authContext";
import { useSubscriptionStatus } from "@/src/hooks/useSubscription";
import { uploadFileToGCS } from "@/src/services/motorServices";
import {
    confirmTenantBanner,
    fetchPublicLandingContent,
    getTenantBannerUploadUrl,
    updateBranding,
    updateLandingConfig,
} from "@/src/services/tenantService";
import type { MotorDisplayConfig } from "@/src/types/tenants";
import { prepareImageForUpload } from "@/src/utils/imageUpload";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { ArrowLeft, Camera, Check } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function toPublicAssetUrl(uploadUrl: string): string {
  try {
    const parsedUrl = new URL(uploadUrl);
    parsedUrl.search = "";
    parsedUrl.hash = "";
    return parsedUrl.toString();
  } catch {
    return uploadUrl.split("?")[0];
  }
}

export default function EditWebsiteScreen() {
  const { user } = useAuthContext();
  const { data: subscription } = useSubscriptionStatus();
  const [selectedTemplate, setSelectedTemplate] = useState<
    WebsiteTemplate["key"]
  >(DEFAULT_WEBSITE_TEMPLATE.key);
  const [bgColor, setBgColor] = useState<string>(
    DEFAULT_WEBSITE_TEMPLATE.primaryColor,
  );
  const [badgeText, setBadgeText] = useState<string>(
    DEFAULT_WEBSITE_TEMPLATE.badgeText,
  );
  const [title, setTitle] = useState<string>(DEFAULT_WEBSITE_TEMPLATE.title);
  const [subtitle, setSubtitle] = useState<string>(
    DEFAULT_WEBSITE_TEMPLATE.subtitle,
  );
  const [showAddress, setShowAddress] = useState<boolean>(
    DEFAULT_WEBSITE_TEMPLATE.showAddress,
  );
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [heroImageAsset, setHeroImageAsset] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [motorDisplay, setMotorDisplay] = useState<MotorDisplayConfig>(
    DEFAULT_MOTOR_DISPLAY,
  );
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const currentSubdomain = subscription?.subdomain ?? user?.subdomain ?? null;

  const activeTemplate =
    WEBSITE_TEMPLATES.find((template) => template.key === selectedTemplate) ??
    DEFAULT_WEBSITE_TEMPLATE;

  const applyTemplate = (template: WebsiteTemplate) => {
    setSelectedTemplate(template.key);
    setBgColor(template.primaryColor);
    setBadgeText(template.badgeText);
    setTitle(template.title);
    setSubtitle(template.subtitle);
    setShowAddress(template.showAddress);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      // Keep the edit preview sharp; the upload path performs one WebP encode.
      quality: 1,
    });

    if (!result.canceled) {
      setHeroImage(result.assets[0].uri);
      setHeroImageAsset(result.assets[0]);
    }
  };

  // Initialize subdomain from current subscription/user
  useEffect(() => {
    if (currentSubdomain && !subdomain) {
      setSubdomain(currentSubdomain);
    }
  }, [currentSubdomain, subdomain]);

  useEffect(() => {
    let active = true;

    async function loadLandingContent() {
      if (!currentSubdomain) {
        setIsLoadingInitial(false);
        return;
      }

      try {
        const response = await fetchPublicLandingContent(currentSubdomain);
        if (!active) return;

        const savedTemplateKey =
          response.tenant.templateKey ?? response.content.templateKey;
        const savedTemplate = WEBSITE_TEMPLATES.find(
          (template) => template.key === savedTemplateKey,
        );

        if (savedTemplate) {
          setSelectedTemplate(savedTemplate.key);
          setBadgeText(savedTemplate.badgeText);
          setTitle(savedTemplate.title);
          setSubtitle(savedTemplate.subtitle);
          setShowAddress(savedTemplate.showAddress);
        }

        if (response.tenant.primaryColor) {
          setBgColor(response.tenant.primaryColor);
        }
        if (response.tenant.bannerUrl) {
          setHeroImage(response.tenant.bannerUrl);
        }
        if (response.tenant.subdomain) {
          setSubdomain(response.tenant.subdomain);
        }

        setWhatsappNumber(response.content.whatsappNumber ?? "");
        const location = response.content.location;
        setCity(location?.city ?? "");
        setAddress(location?.address ?? "");
        setLatitude(
          location?.latitude != null ? String(location.latitude) : "",
        );
        setLongitude(
          location?.longitude != null ? String(location.longitude) : "",
        );
        if (!savedTemplate) {
          setShowAddress(Boolean(location?.address));
        }
        setMotorDisplay(response.content.motorDisplay ?? DEFAULT_MOTOR_DISPLAY);
      } catch (error) {
        if (!active) return;
        Alert.alert(
          "Info",
          error instanceof Error
            ? error.message
            : "Konfigurasi website belum bisa dimuat.",
        );
      } finally {
        if (active) {
          setIsLoadingInitial(false);
        }
      }
    }

    void loadLandingContent();
    return () => {
      active = false;
    };
  }, [currentSubdomain]);

  const handleSave = async () => {
    if (!subscription?.isPremium) {
      Alert.alert(
        "Fitur Premium",
        "Pengaturan website katalog hanya tersedia untuk paket premium.",
      );
      return;
    }

    // Validasi subdomain
    if (!subdomain || subdomain.trim() === "") {
      Alert.alert("Data belum lengkap", "Subdomain showroom harus diisi.");
      return;
    }

    const subdomainTrimmed = subdomain.trim();

    // Validasi panjang subdomain
    if (subdomainTrimmed.length < 3 || subdomainTrimmed.length > 63) {
      Alert.alert(
        "Subdomain tidak valid",
        "Subdomain harus memiliki panjang 3-63 karakter.",
      );
      return;
    }

    // Validasi format subdomain
    const subdomainRegex = /^(?!-)(?!.*--)[a-z0-9-]+(?<!-)$/;
    if (!subdomainRegex.test(subdomainTrimmed)) {
      Alert.alert(
        "Subdomain tidak valid",
        "Subdomain hanya boleh menggunakan huruf kecil, angka, dan tanda hubung. Tidak boleh diawali/diakhiri dengan tanda hubung atau menggunakan tanda hubung berurutan.",
      );
      return;
    }

    const hasLatitude = latitude.trim() !== "";
    const hasLongitude = longitude.trim() !== "";

    if (hasLatitude !== hasLongitude) {
      Alert.alert(
        "Data belum lengkap",
        "Latitude dan longitude harus diisi bersamaan.",
      );
      return;
    }

    const latitudeValue = hasLatitude ? Number(latitude) : undefined;
    const longitudeValue = hasLongitude ? Number(longitude) : undefined;

    if (
      (latitudeValue != null && Number.isNaN(latitudeValue)) ||
      (longitudeValue != null && Number.isNaN(longitudeValue))
    ) {
      Alert.alert("Gagal", "Format latitude atau longitude tidak valid.");
      return;
    }

    try {
      setIsSaving(true);

      const hasLocationPayload =
        city.trim() !== "" ||
        address.trim() !== "" ||
        (latitudeValue != null && longitudeValue != null);

      await updateBranding({
        primaryColor: bgColor,
      });

      await updateLandingConfig({
        templateKey: selectedTemplate,
        subdomain: subdomainTrimmed,
        ...(whatsappNumber.trim()
          ? { whatsappNumber: whatsappNumber.trim() }
          : {}),
        ...(hasLocationPayload
          ? {
              location: {
                ...(city.trim() ? { city: city.trim() } : {}),
                ...(address.trim() ? { address: address.trim() } : {}),
                ...(latitudeValue != null && longitudeValue != null
                  ? {
                      latitude: latitudeValue,
                      longitude: longitudeValue,
                    }
                  : {}),
              },
            }
          : {}),
        motorDisplay,
      });

      if (heroImageAsset) {
        const preparedBanner = await prepareImageForUpload(heroImageAsset, {
          compress: 0.8,
          maxWidth: 1920,
          fallbackName: `banner-${Date.now()}`,
        });
        const upload = await getTenantBannerUploadUrl({
          fileName: preparedBanner.fileName,
          mimeType: preparedBanner.mimeType,
        });

        await uploadFileToGCS(
          upload.uploadUrl,
          preparedBanner.uri,
          preparedBanner.mimeType,
        );

        const bannerUrl = toPublicAssetUrl(upload.uploadUrl);
        await confirmTenantBanner({
          storageKey: upload.filePath,
          url: bannerUrl,
          width: preparedBanner.width,
          height: preparedBanner.height,
          size: preparedBanner.fileSize,
        });

        setHeroImage(bannerUrl);
        setHeroImageAsset(null);
      }

      Alert.alert("Berhasil", "Branding website berhasil disimpan ke server.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        "Gagal",
        error instanceof Error
          ? error.message
          : "Gagal menyimpan konfigurasi website.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-slate-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800">Edit Website</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving || isLoadingInitial}
          className="bg-otokas-primary px-4 py-2 rounded-xl"
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-bold text-sm">Simpan</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-5 pt-5">
          {isLoadingInitial && (
            <View className="bg-white border border-slate-100 rounded-2xl px-4 py-3 mb-4 flex-row items-center gap-3">
              <ActivityIndicator size="small" color="#1e3a8a" />
              <Text className="text-slate-500 text-sm">
                Memuat konfigurasi website...
              </Text>
            </View>
          )}

          <Text className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">
            Pilih Template
          </Text>
          <Text className="text-sm text-slate-500 leading-6 mb-4">
            Pilih gaya tampilan yang paling cocok, lalu lanjutkan dengan
            kustomisasi warna, teks, dan foto utama.
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {WEBSITE_TEMPLATES.map((template) => {
              const isSelected = template.key === selectedTemplate;

              return (
                <TouchableOpacity
                  key={template.key}
                  onPress={() => applyTemplate(template)}
                  activeOpacity={0.9}
                  className={`w-[310px] rounded-[28px] p-3 mr-4 border ${
                    isSelected
                      ? "bg-slate-900 border-slate-900"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <View className="rounded-[22px] overflow-hidden">
                    <CatalogTemplatePreview
                      badgeText={template.badgeText}
                      color={template.primaryColor}
                      heroImage={heroImage}
                      subtitle={template.subtitle}
                      title={template.title}
                      variant={
                        template.key === "template-two" ? "list" : "hero"
                      }
                      compact
                    />
                  </View>

                  <View className="px-1 pt-4 pb-2">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text
                        className={`text-base font-bold ${
                          isSelected ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {template.name}
                      </Text>
                      {isSelected && (
                        <View className="w-7 h-7 rounded-full bg-white/15 items-center justify-center">
                          <Check size={16} color="white" />
                        </View>
                      )}
                    </View>

                    <Text
                      className={`text-xs leading-5 ${
                        isSelected ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {template.description}
                    </Text>

                    <View
                      className={`self-start mt-3 px-3 py-1 rounded-full ${
                        isSelected ? "bg-white/10" : "bg-slate-100"
                      }`}
                    >
                      <Text
                        className={`text-[11px] font-semibold ${
                          isSelected ? "text-white" : "text-slate-600"
                        }`}
                      >
                        {isSelected ? "Template aktif" : "Pilih template ini"}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View className="p-5">
          <Text className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">
            Live Preview (Pratinjau)
          </Text>

          <View className="rounded-3xl overflow-hidden shadow-lg border border-slate-100">
            <CatalogTemplatePreview
              address={showAddress ? address : undefined}
              badgeText={badgeText}
              color={bgColor}
              heroImage={heroImage}
              subtitle={subtitle}
              title={title}
              variant={selectedTemplate === "template-two" ? "list" : "hero"}
            />
          </View>
        </View>

        <View className="bg-white px-5 py-6 border-t border-slate-100 mt-2">
          <View className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-4 mb-6">
            <Text className="text-amber-900 font-bold text-sm mb-1">
              Template aktif: {activeTemplate.name}
            </Text>
            <Text className="text-amber-800/80 text-xs leading-5">
              Setelah memilih template, Anda masih bisa mengubah warna, teks,
              dan foto utama secara manual.
            </Text>
          </View>

          <Text className="font-bold text-slate-800 mb-3">Warna Tema</Text>
          <View className="flex-row gap-3 mb-6">
            {WEBSITE_THEME_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => setBgColor(color)}
                style={{ backgroundColor: color }}
                className="w-12 h-12 rounded-full items-center justify-center border-2 border-slate-100"
              >
                {bgColor === color && <Check size={20} color="white" />}
              </TouchableOpacity>
            ))}
          </View>

          <Text className="font-bold text-slate-800 mb-3">
            Foto Motor Andalan
          </Text>
          <TouchableOpacity
            onPress={pickImage}
            className="flex-row items-center justify-center gap-2 bg-slate-50 border-2 border-slate-200 border-dashed py-4 rounded-2xl mb-6"
          >
            <Camera size={20} color="#64748b" />
            <Text className="text-slate-600 font-semibold">
              {heroImage ? "Ganti Foto Utama" : "Unggah Foto Motor"}
            </Text>
          </TouchableOpacity>

          <View className="space-y-4">
            <View>
              <Text className="text-sm font-bold text-slate-600 mb-1.5">
                Subdomain Showroom
              </Text>
              <View className="flex-row items-center">
                <TextInput
                  value={subdomain}
                  onChangeText={(text) =>
                    setSubdomain(text.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                  }
                  placeholder="namatoko"
                  autoCapitalize="none"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium"
                />
                <Text className="text-slate-600 font-medium ml-2">
                  .otokas.co.id
                </Text>
              </View>
              <Text className="text-slate-400 text-xs mt-2 leading-5">
                Alamat website katalog publik showroom Anda. Gunakan huruf
                kecil, angka, dan tanda hubung.
              </Text>
            </View>

            <View>
              <Text className="text-sm font-bold text-slate-600 mb-1.5">
                Nomor WhatsApp Dealer
              </Text>
              <TextInput
                value={whatsappNumber}
                onChangeText={(text) =>
                  setWhatsappNumber(text.replace(/[^\d+]/g, ""))
                }
                placeholder="Contoh: 6281234567890"
                keyboardType="phone-pad"
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium"
              />
              <Text className="text-slate-400 text-xs mt-2 leading-5">
                Nomor ini akan dipakai untuk tombol kontak di katalog publik.
              </Text>
            </View>

            <View>
              <Text className="text-sm font-bold text-slate-600 mb-1.5">
                Teks Badge (Label)
              </Text>
              <TextInput
                value={badgeText}
                onChangeText={setBadgeText}
                placeholder="Misal: PROMO SPESIAL"
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium"
              />
            </View>

            <View>
              <Text className="text-sm font-bold text-slate-600 mb-1.5 mt-4">
                Judul Banner
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                multiline
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium"
              />
            </View>

            <View>
              <Text className="text-sm font-bold text-slate-600 mb-1.5 mt-4">
                Deskripsi / Subjudul
              </Text>
              <TextInput
                value={subtitle}
                onChangeText={setSubtitle}
                multiline
                numberOfLines={3}
                style={{ textAlignVertical: "top" }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium h-24"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
