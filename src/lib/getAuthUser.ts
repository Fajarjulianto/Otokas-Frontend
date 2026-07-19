import { AUTH_KEY } from "@/src/constants/storage";
import type { AuthUser } from "@/src/context/authContext";
import { getToken } from "@/src/lib/secureToken";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getAuthUser(): Promise<AuthUser> {
  const raw = await AsyncStorage.getItem(AUTH_KEY);
  if (!raw) throw new Error("User tidak ditemukan. Silakan login ulang.");
  const user = JSON.parse(raw) as AuthUser;

  // Retrieve token from SecureStore
  const token = await getToken();
  if (token) {
    user.token = token;
  }

  return user;
}
