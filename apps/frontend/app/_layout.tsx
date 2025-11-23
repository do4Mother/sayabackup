import "@/assets/css/global.css";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAlert } from "@/hooks/use_alert";
import { useApp } from "@/hooks/use_app";
import { client, queryClient, trpc, TRPCProvider } from "@/trpc/trpc";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, usePathname, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useShallow } from "zustand/react/shallow";

export default function RootLayout() {
  return (
    <TRPCProvider client={client} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <StackRootLayout />
        <PortalHost />
        <RootAlertDialog />
      </QueryClientProvider>
    </TRPCProvider>
  );
}

function StackRootLayout() {
  const user = trpc.auth.me.useQuery();
  const setUser = useApp((state) => state.setUser);
  const router = useRouter();
  const pathname = usePathname();

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

function RootAlertDialog() {
  const alert = useAlert(
    useShallow((state) => ({
      open: state.open,
      title: state.title,
      message: state.message,
      setOpen: state.setOpen,
    })),
  );
  return (
    <AlertDialog open={alert.open} onOpenChange={alert.setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{alert.title}</AlertDialogTitle>
          <AlertDialogDescription>{alert.message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>OK</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
