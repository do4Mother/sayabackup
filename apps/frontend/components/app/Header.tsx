import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import { Text } from "../ui/text";

export type HeaderProps = {
  variant?: "default" | "large";
  title: string;
  disableBackButton?: boolean;
};

export default function Header(props: HeaderProps) {
  const router = useRouter();

  if (!router.canGoBack() && props.title === "") {
    return (
      <View className="h-14 bg-background items-center justify-center">
        <Pressable
          onPress={() => router.replace("/(protected)/home/(tabs)/gallery")}
        >
          <Text className="font-bold text-xl">SayaBackup</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="items-center flex-row h-14 px-4 gap-2 bg-background">
      {!props.disableBackButton && router.canGoBack() && (
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} />
        </Pressable>
      )}
      <Text
        className={cn(
          props.variant === "large"
            ? "text-2xl font-bold"
            : "text-lg font-semibold",
          "capitalize",
        )}
      >
        {props.title}
      </Text>
    </View>
  );
}
