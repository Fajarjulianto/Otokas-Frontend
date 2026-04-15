import { Tabs, useRouter } from "expo-router";
import {
  BarChart3,
  Home,
  Package,
  PlusCircle,
  User,
} from "lucide-react-native";
import { View } from "react-native";

export default function TabLayout() {
  const primaryColor = "#1e3a8a"; // Blue-900
  const accentColor = "#f59e0b"; // Amber-500
  const router = useRouter();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: {
          height: 107,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: "#e2e8f0",
          backgroundColor: "#ffffff",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Beranda",
          tabBarIcon: ({ color }) => (
            <Home color={color} size={24} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="stok"
        options={{
          title: "Stok",
          tabBarIcon: ({ color }) => (
            <Package color={color} size={24} strokeWidth={2} />
          ),
        }}
      />

      <Tabs.Screen
        name="tambah"
        options={{
          title: "Tambah",
          tabBarLabelStyle: { color: accentColor, fontWeight: "700" },
          tabBarIcon: () => (
            <View className="bg-amber-100 p-1 rounded-full -mt-4 shadow-sm">
              <PlusCircle color={accentColor} size={32} strokeWidth={2.5} />
            </View>
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push("/(tabs)/tambah");
          },
        }}
      />

      <Tabs.Screen
        name="laporan"
        options={{
          title: "Laporan",
          tabBarIcon: ({ color }) => (
            <BarChart3 color={color} size={24} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => (
            <User color={color} size={24} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}
