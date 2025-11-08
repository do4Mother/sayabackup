import "@/assets/css/global.css";
import { useApp } from "@/hooks/use_app";
import { client, queryClient, trpc, TRPCProvider } from "@/trpc/trpc";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  return (
    <TRPCProvider client={client} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <StackRootLayout />
        <PortalHost />
      </QueryClientProvider>
    </TRPCProvider>
  );
}

function StackRootLayout() {
  const user = trpc.auth.me.useQuery();
  const router = useRouter();
  const appState = useApp((state) => state.user);
  const setUser = useApp((state) => state.setUser);

  useEffect(() => {
    if (user.data) {
      setUser(user.data.user);
      router.replace("/home/photo");
    }
  }, [user.data]);

  if (user.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size={"large"} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Protected guard={appState != null}>
        <Stack.Screen name="(protected)" />
      </Stack.Protected>
    </Stack>
  );
}
