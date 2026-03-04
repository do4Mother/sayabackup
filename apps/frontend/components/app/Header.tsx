import { ScrollListenerContext } from "@/hooks/useScrollListener";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext, useEffect, useRef } from "react";
import { Pressable, View } from "react-native";
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
  hideOnScroll?: boolean;
};

export function Header(props: HeaderProps) {
  const defaultProps = {
    showBackButton: true,
  };
  props = { ...defaultProps, ...props };
  const position = useSharedValue(0);
  const lastScrollY = useRef(0);
  const scrollListenerContext = useContext(ScrollListenerContext);

  if (!scrollListenerContext && props.hideOnScroll) {
    throw new Error("Header must be used within a ScrollListenerProvider");
  }

  useEffect(() => {
    if (!props.hideOnScroll) return;

    const unsubscribe = scrollListenerContext?.subscribe(
      (state) => state.scrollY,
      (scrollY) => {
        const currentScrollY = scrollY;

        if (currentScrollY <= 0) {
          // At the top, show header
          position.value = withDelay(100, withTiming(0));
        } else if (
          currentScrollY > lastScrollY.current &&
          currentScrollY > 50
        ) {
          // Scrolling down, hide header
          position.value = withDelay(100, withTiming(-100));
        } else if (currentScrollY < lastScrollY.current) {
          // Scrolling up, show header
          position.value = withDelay(100, withTiming(0));
        }

        lastScrollY.current = currentScrollY;
      },
    );

    return () => {
      unsubscribe?.();
    };
  }, [scrollListenerContext]);

  const HeaderComponent = () => (
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

  if (props.hideOnScroll) {
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
        <HeaderComponent />
      </Animated.View>
    );
  }

  return <HeaderComponent />;
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
