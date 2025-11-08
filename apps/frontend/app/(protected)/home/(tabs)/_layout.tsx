import MaterialIcons from "@expo/vector-icons/MaterialIcons";
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
        name="photo"
        options={{
          title: "Photos",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="photo" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: "Upload",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="upload" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="setting"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="settings" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
