import Header from "@/components/app/Header";
import { Stack } from "expo-router";
import React from "react";

export default function ProtectedLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        header: (props) => (
          <Header title={props.options.title ?? props.route.name} />
        ),
      }}
    />
  );
}
