import Header from "@/components/app/Header";
import { useApp } from "@/hooks/use_app";
import { Redirect, Stack } from "expo-router";
import React from "react";

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
    />
  );
}
