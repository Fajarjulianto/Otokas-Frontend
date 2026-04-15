import { supabase } from "@/src/lib/supabase";
import type {
  LoginPayload,
  RegisterPayload,
} from "@/src/services/authServices";
import { login, logout, register } from "@/src/services/authServices";
import { Session } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";

//Global State
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, loading, user: session?.user ?? null };
}

// ── Register ──
export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
  });
}

// ── Login ──
export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
  });
}

// ── Logout ──
export function useLogout() {
  return useMutation({
    mutationFn: logout,
  });
}
