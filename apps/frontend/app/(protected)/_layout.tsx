import Logo from "@/assets/images/sayabackup.png";
import { useApp } from "@/hooks/use_app";
import { Image } from "expo-image";
import { Redirect, Stack, useRouter } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";

// Configure anchor for modal routes
export const unstable_settings = {
  anchor: "home/(tabs)/gallery",
};

export default function ProtectedLayout() {
  const userState = useApp((state) => state.user);
  const router = useRouter();

  if (!userState) {
    return <Redirect href="/" />;
  }

  return (
    <View className="flex-1">
      <View className="p-4 hidden md:flex bg-background border-border border-b">
        <Pressable onPress={() => router.push("/home/gallery")}>
          <Image source={Logo} style={{ width: 180, height: 40 }} />
        </Pressable>
      </View>
      <View className="flex-1">
        <Stack
          screenOptions={{
            headerShadowVisible: false,
          }}
        >
          {/* Configure modal presentation for gallery route */}
          <Stack.Screen
            name="gallery/index"
            options={{
              presentation: "modal",
            }}
          />
        </Stack>
      </View>
    </View>
  );
}
