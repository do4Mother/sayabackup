import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/trpc";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  View,
} from "react-native";
import { Text } from "../ui/text";

type ImageDetailProps = {
  albumId?: string;
};

export default function ImageDetail(props: ImageDetailProps) {
  const dimensions = Dimensions.get("window");
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const params = useLocalSearchParams();
  const images = trpc.gallery.get.useQuery({
    albumId: props.albumId,
  });
  const initialIndex =
    images.data?.findIndex((item) => item.id === params.id) ?? 0;
  const isHaveAlbum = images.data?.[activeIndex]?.album_id !== null;

  useEffect(() => {
    if (!images.data) return;

    flatListRef.current?.scrollToOffset({
      offset: initialIndex * dimensions.width,
    });
  }, [images.data]);

  return (
    <>
      <FlatList
        ref={flatListRef}
        data={images.data}
        className="bg-background"
        contentContainerClassName="gap-4 items-center"
        snapToAlignment="center"
        snapToInterval={dimensions.width}
        onScroll={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / dimensions.width,
          );
          setActiveIndex(index);
        }}
        decelerationRate={"fast"}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        renderItem={({ item }) => (
          <View
            key={item.id}
            style={{
              width: dimensions.width,
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ImageScalable source={{ uri: item?.thumbnail_url }} />
          </View>
        )}
      />
      <View className="h-[55px] bg-background border-t border-slate-200 flex-row px-4 py-2 gap-x-4 justify-around">
        <View className="items-center justify-center">
          <AntDesign name="cloud-download" size={20} />
          <Text className="text-xs font-semibold">Download</Text>
        </View>
        <View className="items-center justify-center">
          <Ionicons
            name="albums-outline"
            size={20}
            className={isHaveAlbum ? "text-gray-400" : ""}
          />
          <Text
            className={cn(
              "text-xs font-semibold",
              isHaveAlbum && "text-gray-400",
            )}
          >
            Add to Album
          </Text>
        </View>
        <View className="items-center justify-center">
          <Ionicons name="trash-outline" size={20} />
          <Text className="text-xs font-semibold">Delete</Text>
        </View>
      </View>
    </>
  );
}

function ImageScalable(props: { source: { uri: string } }) {
  const dimensions = Dimensions.get("window");
  const [isLoading, setIsLoading] = useState(true);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    Image.getSize(
      props.source.uri,
      (width, height) => {
        const maxWidth = dimensions.width;
        const maxHeight = dimensions.height;

        let finalWidth = maxWidth;
        let finalHeight = (height * maxWidth) / width;

        if (finalHeight > maxHeight) {
          finalHeight = maxHeight;
          finalWidth = (width * maxHeight) / height;
        }

        setImageDimensions({ width: finalWidth, height: finalHeight });
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
      },
    );
  }, []);

  return !isLoading ? (
    <Image
      source={props.source}
      style={{ width: imageDimensions?.width, height: imageDimensions?.height }}
    />
  ) : (
    <ActivityIndicator />
  );
}
