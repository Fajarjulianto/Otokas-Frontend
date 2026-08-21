import { useAuthContext } from "@/src/context/authContext";
import {
  changePassword,
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
    queryKey: userKeys.profile,
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
      queryClient.invalidateQueries({ queryKey: userKeys.profile });
      await updateUser({
        ...(updatedData.dealerName
          ? { dealerName: updatedData.dealerName }
          : {}),
        ...(updatedData.address ? { address: updatedData.address } : {}),
        ...(updatedData.subdomain ? { subdomain: updatedData.subdomain } : {}),
        ...(updatedData.fullDomain
          ? { fullDomain: updatedData.fullDomain }
          : {}),
      });
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

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ newPassword }: { newPassword: string }) =>
      changePassword(newPassword),
  });
}
