import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  View,
} from "react-native";
import Animated, {
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { Text } from "../ui/text";

type HeaderProps = {
  title?: string;
  showBackButton?: boolean;
  action?: React.ReactNode;
};

export default function useHeader() {
  const position = useSharedValue(0);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    position.value = withDelay(
      100,
      withTiming(event.nativeEvent.contentOffset.y > 50 ? -100 : 0),
    );
  };

  return {
    onScroll,
    Header: (props: HeaderProps) => {
      const defaultProps = {
        showBackButton: true,
      };
      props = { ...defaultProps, ...props };
      return (
        <Animated.View
          style={{
            position: "absolute",
            top: position,
            left: 0,
            right: 0,
            zIndex: 10,
            height: 56,
          }}
        >
          <Header {...props} />
        </Animated.View>
      );
    },
  };
}

function Header(props: HeaderProps) {
  return (
    <View className="flex-row gap-4 bg-background px-4 h-14 items-center lg:h-16">
      {props.showBackButton && <BackButton />}
      {props.title && (
        <Text className="text-2xl font-bold md:text-3xl">{props.title}</Text>
      )}
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
