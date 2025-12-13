import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { Text } from "../ui/text";

type HeaderProps = {
  title?: string;
  showBackButton?: boolean;
  action?: React.ReactNode;
};

export default function Header(props: HeaderProps) {
  const defaultProps = {
    showBackButton: true,
  };
  props = { ...defaultProps, ...props };

  return (
    <View className="flex-row gap-4 bg-background px-4 h-14 items-center">
      {props.showBackButton && <BackButton />}
      {props.title && <Text className="text-2xl font-bold">{props.title}</Text>}
      <View className="flex-row gap-4 flex-1 justify-end items-center">
        {props.action}
      </View>
    </View>
  );
}

export function BackButton() {
  const router = useRouter();

  if (!router.canGoBack()) {
    return null;
  }

  return (
    <Pressable onPress={() => router.back()}>
      <Ionicons name="chevron-back" size={24} color="black" />
    </Pressable>
  );
}
