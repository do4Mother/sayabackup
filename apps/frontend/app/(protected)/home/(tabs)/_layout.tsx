import Heading from "@/components/app/Heading";
import { Ionicons } from "@expo/vector-icons";
import { Stack, Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function HomePageLayout() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs
        screenOptions={{
          header(props) {
            return (
              <View className="bg-background">
                <Heading title={props.route.name} />
              </View>
            );
          },
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
