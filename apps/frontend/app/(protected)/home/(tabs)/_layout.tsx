import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Tabs } from "expo-router";
import React from "react";

export default function HomePageLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          height: 55,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="gallery"
        options={{
          title: "Gallery",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="photo-film" size={16} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: "Upload",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="upload" size={16} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="setting"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="gears" size={16} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
