import { useAuthContext } from "@/src/context/authContext";
import {
  fetchProfile,
  requestPasswordReset,
  resetPassword,
  updateProfile,
} from "@/src/services/userServices";
import type { UpdateProfilePayload } from "@/src/types/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const userKeys = {
  profile: ["user", "profile"] as const,
};

export function useProfile() {
  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: fetchProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthContext();

  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      return await updateProfile(payload);
    },
    onSuccess: async (updatedData) => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
      if (updatedData.dealerName) {
        await updateUser({ dealerName: updatedData.dealerName });
      }
    },
  });
}
export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email: string) => requestPasswordReset(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({
      email,
      otp,
      newPassword,
    }: {
      email: string;
      otp: string;
      newPassword: string;
    }) => resetPassword(email, otp, newPassword),
  });
}
