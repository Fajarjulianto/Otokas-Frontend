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
  return useQuery({
    queryKey: subscriptionKeys.status,
    queryFn: fetchSubscriptionStatus,
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
    mutationFn: fetchSubscriptionStatus,
    onSuccess: async (status) => {
      queryClient.setQueryData(subscriptionKeys.status, status);
      await updateUser({ isPremium: status.isPremium });
    },
  });
}
