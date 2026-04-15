import { supabase } from "@/src/lib/supabase";

export async function getAuthUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User tidak ditemukan. Silakan login ulang.");
  return user;
}
