import Header from "@/components/app/Header";
import { useApp } from "@/hooks/use_app";
import { Stack } from "expo-router";
import React from "react";

export default function ProtectedLayout() {
  const userState = useApp((state) => state.user);

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        header: (props) => (
          <Header title={props.options.title ?? props.route.name} />
        ),
      }}
    >
      <Stack.Protected guard={userState != null}>
        <Stack.Screen name="(protected" />
      </Stack.Protected>
    </Stack>
  );
}
