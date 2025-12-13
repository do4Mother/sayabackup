import Header from "@/components/app/Header";
import ImageList from "@/components/app/ImageList";
import { Fragment } from "react";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import Animated, {
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

export default function HomeTabPage() {
  const position = useSharedValue(0);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    position.value = withDelay(
      100,
      withTiming(event.nativeEvent.contentOffset.y > 50 ? -100 : 0),
    );
  };

  return (
    <Fragment>
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
        <Header title="Gallery" showBackButton={false} />
      </Animated.View>
      <ImageList onScroll={onScroll} className="pt-16" />
    </Fragment>
  );
}
