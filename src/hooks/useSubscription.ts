import { useAuthContext } from "@/src/context/authContext";
import {
  checkoutSubscription,
  fetchSubscriptionStatus,
} from "@/src/services/subscriptionServices";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const subscriptionKeys = {
  status: ["subscription", "status"] as const,
};

export function useSubscriptionStatus() {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: subscriptionKeys.status,
    queryFn: ({ signal }) => fetchSubscriptionStatus(signal),
    enabled: !!user,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useCheckoutSubscription() {
  return useMutation({
    mutationFn: checkoutSubscription,
  });
}

export function useRefreshSubscription() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthContext();

  return useMutation({
    mutationFn: async () => {
      await queryClient.cancelQueries({ queryKey: subscriptionKeys.status });
      return fetchSubscriptionStatus();
    },
    onSuccess: async (status) => {
      queryClient.setQueryData(subscriptionKeys.status, status);
      await updateUser({ isPremium: status.isPremium });
    },
  });
}
