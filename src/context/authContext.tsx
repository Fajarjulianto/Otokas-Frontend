import { onSessionExpired } from "@/src/lib/authSession";
import { AUTH_KEY } from "@/src/constants/storage";
import {
  deleteToken,
  deleteRefreshToken,
  getRefreshToken,
  getToken,
  saveToken,
} from "@/src/lib/secureToken";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ─── Types ────
export type AuthUser = {
  id?: string;
  email: string;
  fullName?: string;
  dealerName?: string;
  address?: string;
  phoneNumber?: string;
  subdomain?: string;
  fullDomain?: string;
  isPremium?: boolean;
  token?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (user: AuthUser) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => Promise<void>;
};

// ─── Context ─────
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  updateUser: async () => {},
});

// ─── Provider ─────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(AUTH_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as AuthUser;
          //
          const secureToken = await getToken();
          if (secureToken) {
            parsed.token = secureToken;
          }
          if (secureToken || (await getRefreshToken())) setUser(parsed);
          else await AsyncStorage.removeItem(AUTH_KEY);
        }
      } catch {
        await AsyncStorage.removeItem(AUTH_KEY);
        await deleteToken();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (userData: AuthUser) => {
    // Store token securely, separate from profile data
    if (userData.token) {
      await saveToken(userData.token);
    }
    // Store non-sensitive profile data in AsyncStorage (without token)
    const { token: _token, ...profileData } = userData;
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(profileData));
    setUser(userData);
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
    await Promise.all([deleteToken(), deleteRefreshToken()]);
    setUser(null);
    router.replace("/(auth)/login");
  }, [router]);

  useEffect(
    () =>
      onSessionExpired(() => {
        void signOut();
      }),
    [signOut],
  );

  const updateUser = useCallback(async (updates: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };

      // If token is being updated, save to SecureStore
      if (updates.token) {
        saveToken(updates.token).catch(() => {});
      }

      // Save non-sensitive profile data to AsyncStorage
      const { token: _token, ...profileData } = updated;
      AsyncStorage.setItem(AUTH_KEY, JSON.stringify(profileData)).catch(
        () => {},
      );
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signIn, signOut, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext harus dipakai di dalam AuthProvider");
  }
  return context;
}
