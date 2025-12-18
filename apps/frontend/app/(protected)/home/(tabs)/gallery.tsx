import Header from "@/components/app/Header";
import HeaderImagePage from "@/components/app/HeaderImagePage";
import ImageList from "@/components/app/ImageList";
import { useSelectedImage } from "@/hooks/use_select_image";
import { Fragment } from "react";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import Animated, {
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { match, P } from "ts-pattern";

export default function HomeTabPage() {
  const position = useSharedValue(0);
  const selectedImages = useSelectedImage((state) => state.selectedImages);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    position.value = withDelay(
      100,
      withTiming(event.nativeEvent.contentOffset.y > 50 ? -100 : 0),
    );
  };

  return (
    <Fragment>
      {match(selectedImages.length)
        .with(P.number.gt(0), () => <HeaderImagePage />)
        .otherwise(() => (
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
        ))}

      <ImageList onScroll={onScroll} className="pt-16" />
    </Fragment>
  );
}
