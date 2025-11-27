import { useApp } from "@/hooks/use_app";
import { Redirect, Stack } from "expo-router";
import React from "react";

// Configure anchor for modal routes
export const unstable_settings = {
  anchor: "home/(tabs)/gallery",
};

export default function ProtectedLayout() {
  const userState = useApp((state) => state.user);

  if (!userState) {
    return <Redirect href="/" />;
  }

  return (
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
  );
}
