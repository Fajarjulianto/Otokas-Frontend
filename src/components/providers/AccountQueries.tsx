import { useAuthContext } from "@/src/context/authContext";
import { subscriptionKeys } from "@/src/hooks/useSubscription";
import { userKeys } from "@/src/hooks/useUser";
import { fetchSubscriptionStatus } from "@/src/services/subscriptionServices";
import type { UserProfile } from "@/src/types/user";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { usePathname } from "expo-router";
import React, { useEffect, useState } from "react";
import { AppState } from "react-native";

function SubscriptionSync({ client }: { client: QueryClient }) {
  const { user, updateUser } = useAuthContext();
  const pathname = usePathname();
  const authenticated = !!user;
  const { data } = useQuery({
    queryKey: subscriptionKeys.status,
    queryFn: ({ signal }) => fetchSubscriptionStatus(signal),
    enabled: !!user,
    staleTime: 0,
  });
  useEffect(() => {
    if (!authenticated) return;
    let active = true;
    const refresh = () => {
      if (AppState.currentState === "active") {
        void client
          .cancelQueries({ queryKey: subscriptionKeys.status })
          .then(() =>
            active
              ? client.invalidateQueries({ queryKey: subscriptionKeys.status })
              : undefined,
          );
      }
    };
    refresh();
    const listener = AppState.addEventListener("change", refresh);
    return () => {
      active = false;
      listener.remove();
    };
  }, [client, pathname, authenticated]);
  useEffect(() => {
    if (!data || !user) return;
    const updates = {
      isPremium: data.isPremium,
      ...(data.subdomain ? { subdomain: data.subdomain } : {}),
    };
    client.setQueriesData<UserProfile>({ queryKey: userKeys.profile }, (old) =>
      old ? { ...old, ...updates } : old,
    );
    if (
      user.isPremium !== data.isPremium ||
      (data.subdomain && user.subdomain !== data.subdomain)
    ) {
      void updateUser(updates);
    }
  }, [data, client, updateUser, user]);
  return null;
}

/** Every login gets a separate cache, including motor and analytics queries. */
export function AccountQueries({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();
  const account = user?.id ?? user?.email ?? "anonymous";
  return <AccountQuerySession key={account}>{children}</AccountQuerySession>;
}

function AccountQuerySession({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: 2,
            refetchOnWindowFocus: false,
          },
          mutations: { retry: 0 },
        },
      }),
  );
  useEffect(
    () => () => {
      void client.cancelQueries();
      client.clear();
    },
    [client],
  );
  return (
    <QueryClientProvider client={client}>
      <SubscriptionSync client={client} />
      {children}
    </QueryClientProvider>
  );
}
