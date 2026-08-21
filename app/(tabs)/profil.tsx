import { useAuthContext } from "@/src/context/authContext";
import { useLogout } from "@/src/hooks/useAuth";
import { useSubscriptionStatus } from "@/src/hooks/useSubscription";
import { useProfile } from "@/src/hooks/useUser";
import { router } from "expo-router";
import {
  ArrowLeft,
  ChevronRight,
  Crown,
  Home,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MenuItem = ({
  icon: Icon,
  iconColor = "#4B5563",
  iconBg = "#F9FAFB",
  title,
  subtitle,
  onPress,
  isHighlight = false,
}: {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  iconColor?: string;
  iconBg?: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  isHighlight?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center justify-between p-4 border-b border-gray-100 bg-white"
  >
    <View className="flex-row items-center flex-1">
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-4"
        style={{ backgroundColor: iconBg }}
      >
        <Icon size={20} color={iconColor} strokeWidth={2} />
      </View>
      <View className="flex-1">
        <Text
          className={`font-bold text-base ${isHighlight ? "text-amber-500" : "text-gray-800"}`}
        >
          {title}
        </Text>
        <Text className="text-gray-400 text-xs mt-0.5">{subtitle}</Text>
      </View>
    </View>
    <ChevronRight size={20} color="#9CA3AF" strokeWidth={2} />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const { user } = useAuthContext();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: subscription } = useSubscriptionStatus();
  const logoutMutation = useLogout();

  const displayName = profile?.dealerName || user?.dealerName || "Dealer";
  const displayEmail = profile?.email || user?.email || "";
  const displayPhone = profile?.phoneNumber || "";
  const displayAddress = profile?.address || user?.address || "";
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isPremium = subscription?.isPremium ?? user?.isPremium ?? false;
  const planName = subscription?.plan || (isPremium ? "Juragan" : "Gratis");

  const handleLogout = () => {
    Alert.alert("Keluar Akun", "Apakah Bos yakin ingin keluar dari Otokas?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Keluar",
        style: "destructive",
        onPress: () => {
          logoutMutation.mutate(undefined, {
            onSuccess: () => router.replace("/"),
            onError: () => router.replace("/"),
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* HEADER */}
      <View className="bg-otokas-primary pt-4 pb-12 px-6 rounded-b-[32px] shadow-lg">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center"
          >
            <ArrowLeft size={20} color="white" strokeWidth={2} />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold ml-4">Profil</Text>
        </View>

        <View className="flex-row items-center">
          {/* Avatar */}
          <View className="w-16 h-16 bg-amber-400 rounded-full items-center justify-center border-2 border-white">
            <Text className="text-white text-2xl font-bold">{initials}</Text>
          </View>

          {/* Info User */}
          <View className="ml-4 flex-1">
            {profileLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Text className="text-white text-xl font-bold">
                  {displayName}
                </Text>
                <Text className="text-blue-200 text-sm mt-0.5">
                  {displayEmail}
                </Text>
              </>
            )}
            <View
              className={`px-3 py-1 rounded-full mt-2 self-start border ${
                isPremium
                  ? "bg-orange-500/30 border-orange-400/50"
                  : "bg-white/10 border-white/20"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  isPremium ? "text-orange-300" : "text-blue-200"
                }`}
              >
                Paket {planName}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* KARTU KONTAK INFO */}
        <View
          className="bg-white rounded-2xl p-5 mb-5 mt-5"
          style={{
            elevation: 2,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <View className="flex-row items-center mb-3">
            <Phone size={16} color="#6B7280" strokeWidth={2} />
            <Text className="text-gray-600 ml-3 text-sm">
              {displayPhone || "Belum diisi"}
            </Text>
          </View>
          <View className="flex-row items-center mb-3">
            <Mail size={16} color="#6B7280" strokeWidth={2} />
            <Text className="text-gray-600 ml-3 text-sm">
              {displayEmail || "Belum diisi"}
            </Text>
          </View>
          <View className="flex-row items-center">
            <MapPin size={16} color="#6B7280" strokeWidth={2} />
            <Text className="text-gray-600 ml-3 text-sm flex-1">
              {displayAddress || "Belum diisi"}
            </Text>
          </View>
        </View>

        {/* LIST MENU SETTING */}
        <View
          className="bg-white rounded-2xl overflow-hidden mb-5"
          style={{
            elevation: 2,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          {/* ── MENU LANGGANAN ── */}
          <MenuItem
            icon={Crown}
            iconColor="#f59e0b"
            iconBg="#fef3c7"
            title="Langganan"
            subtitle="Kelola paket & riwayat pembayaran"
            onPress={() => router.push("/paket")}
            isHighlight
          />
          <MenuItem
            icon={User}
            title="Edit Profil"
            subtitle="Ubah nama, kontak, dan alamat showroom"
            onPress={() => router.push("/edit-profile")}
          />
          <MenuItem
            icon={Home}
            title="Data Showroom"
            subtitle="Ubah nama dan alamat showroom"
            onPress={() => router.push("/edit-profile")}
          />
          <MenuItem
            icon={Lock}
            title="Keamanan"
            subtitle="Ubah password akun"
            onPress={() => router.push("/edit-profile")}
          />
        </View>

        {/* TOMBOL LOGOUT */}
        <TouchableOpacity
          onPress={handleLogout}
          disabled={logoutMutation.isPending}
          className="bg-red-50 border border-red-100 flex-row justify-center items-center py-4 rounded-2xl"
        >
          {logoutMutation.isPending ? (
            <ActivityIndicator size="small" color="#DC2626" />
          ) : (
            <>
              <LogOut size={20} color="#DC2626" strokeWidth={2} />
              <Text className="text-red-600 font-bold ml-2 text-base">
                Keluar dari Akun
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
