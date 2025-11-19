import "@/assets/css/global.css";
import { useApp } from "@/hooks/use_app";
import { client, queryClient, trpc, TRPCProvider } from "@/trpc/trpc";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, usePathname, useRouter } from "expo-router";
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
  const setUser = useApp((state) => state.setUser);
  const router = useRouter();
  const pathname = usePathname();

  console.log("Current pathname:", pathname);

  useEffect(() => {
    if (user.data) {
      setUser(user.data.user);
      if (pathname === "/") {
        router.replace("/(protected)/home/(tabs)/gallery");
      }
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
    />
  );
}
