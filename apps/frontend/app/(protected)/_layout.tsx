import Header from "@/components/app/Header";
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
        header: (props) => (
          <Header title={props.options.title ?? props.route.name} />
        ),
      }}
    >
      {/* Configure modal presentation for gallery route */}
      <Stack.Screen
        name="gallery/index"
        options={{
          presentation: "modal",
          sheetAllowedDetents: [0.5, 1],
        }}
      />
    </Stack>
  );
}
