import { useEffect } from "react";
import type { UpdateProfilePayload, UserProfile } from "@/src/types/user";
import { useAuthContext } from "@/src/context/authContext";
import {
  changePassword,
  fetchProfile,
  requestPasswordReset,
  resetPassword,
  updateProfile,
} from "@/src/services/userServices";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const userKeys = {
  profile: ["user", "profile"] as const,
};

export function useProfile() {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuthContext();
  const query = useQuery({
    enabled: !!user,
    staleTime: 0,
    refetchOnMount: "always",
    queryKey: userKeys.profile,
    queryFn: async ({ signal }) => {
      const profile = await fetchProfile({ signal });
      const status = queryClient.getQueryData<{ isPremium: boolean }>([
        "subscription",
        "status",
      ]);
      return status ? { ...profile, isPremium: status.isPremium } : profile;
    },
  });
  useEffect(() => {
    if (!query.data || !user) return;
    const updates = {
      dealerName: query.data.dealerName,
      phoneNumber: query.data.phoneNumber ?? "",
      address: query.data.address ?? "",
      ...(query.data.subdomain !== undefined
        ? { subdomain: query.data.subdomain }
        : {}),
      ...(query.data.fullDomain !== undefined
        ? { fullDomain: query.data.fullDomain }
        : {}),
    };
    if (
      Object.entries(updates).some(
        ([key, value]) => user[key as keyof typeof user] !== value,
      )
    )
      void updateUser(updates);
  }, [query.data, updateUser, user]);
  return query;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthContext();

  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      return await updateProfile(payload);
    },
    onSuccess: async (updatedData) => {
      await queryClient.cancelQueries({ queryKey: userKeys.profile });
      queryClient.setQueryData<UserProfile>(userKeys.profile, (old) => ({
        ...old,
        ...updatedData,
      }));
      await updateUser({
        dealerName: updatedData.dealerName,
        phoneNumber: updatedData.phoneNumber ?? "",
        address: updatedData.address ?? "",
        ...(updatedData.subdomain !== undefined
          ? { subdomain: updatedData.subdomain }
          : {}),
        ...(updatedData.fullDomain !== undefined
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
    mutationFn: ({
      newPassword,
      currentPassword,
    }: {
      newPassword: string;
      currentPassword: string;
    }) => changePassword(newPassword, currentPassword),
  });
}
