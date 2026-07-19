import { useAuthContext } from "@/src/context/authContext";
import type {
  LoginPayload,
  RegisterPayload,
} from "@/src/services/authServices";
import { login, logout, register } from "@/src/services/authServices";
import { useMutation } from "@tanstack/react-query";

export function useAuth() {
  const { user, isLoading } = useAuthContext();
  return { user, loading: isLoading, isAuthenticated: !!user };
}

// ── Register ──
export function useRegister() {
  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const response = await register(payload);
      return response;
    },
  });
}

// ── Login ──
// Di dalam src/hooks/useAuth.ts
export function useLogin() {
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const response = await login(payload);
      if (!response.access_token) {
        throw new Error("Token tidak ditemukan dari server.");
      }
      return response;
    },
  });
}

// ── Logout ──
export function useLogout() {
  const { signOut } = useAuthContext();
  return useMutation({
    mutationFn: async () => {
      try {
        await logout();
      } catch {}
      await signOut();
    },
  });
}
