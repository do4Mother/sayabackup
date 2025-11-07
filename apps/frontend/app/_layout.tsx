import { client, queryClient, TRPCProvider } from "@/trpc/trpc";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <TRPCProvider client={client} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }} />
      </QueryClientProvider>
    </TRPCProvider>
  );
}
