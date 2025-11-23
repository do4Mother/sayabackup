import Header from "@/components/app/Header";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { Stack, Tabs } from "expo-router";
import React from "react";
import { Dimensions } from "react-native";
import { match } from "ts-pattern";

export default function HomePageLayout() {
  const dimensions = Dimensions.get("window");

  const tabbarConfig = match(dimensions.width)
    .returnType<BottomTabNavigationOptions>()
    .when(
      (v) => v > 1000,
      () => ({
        tabBarVariant: "material",
        tabBarPosition: "left",
        tabBarLabelPosition: "beside-icon",
        tabBarStyle: {
          minWidth: 200,
        },
      }),
    )
    .when(
      (v) => v > 600,
      () => ({
        tabBarVariant: "material",
        tabBarPosition: "left",
        tabBarLabelPosition: "below-icon",
      }),
    )
    .otherwise(() => ({
      tabBarVariant: "uikit",
      tabBarPosition: "bottom",
      tabBarStyle: {
        height: 55,
      },
      tabBarItemStyle: {
        alignItems: "center",
      },
      tabBarIconStyle: { width: 20, height: 20, flex: 1 },
      tabBarLabelStyle: { fontSize: 12, paddingBottom: 4 },
    }));

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs
        screenOptions={{
          ...tabbarConfig,
          header(props) {
            return (
              <Header
                title={props.route.name}
                variant="large"
                disableBackButton
              />
            );
          },
        }}
      >
        <Tabs.Screen
          name="gallery"
          options={{
            title: "Gallery",
            tabBarIcon: ({ color }) => (
              <Ionicons name="images-outline" size={20} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="albums"
          options={{
            title: "Albums",
            tabBarIcon: ({ color }) => (
              <Ionicons name="albums-outline" size={20} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="upload"
          options={{
            title: "Upload",
            tabBarIcon: ({ color }) => (
              <Ionicons name="cloud-upload-outline" size={20} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="setting"
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => (
              <Ionicons name="settings-outline" size={20} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
