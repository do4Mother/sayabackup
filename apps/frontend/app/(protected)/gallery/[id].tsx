import { trpc } from "@/trpc/trpc";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  View,
} from "react-native";

export default function GalleryDetailPage() {
  const dimensions = Dimensions.get("window");
  const flatListRef = useRef<FlatList>(null);
  const params = useLocalSearchParams();
  const client = trpc.useUtils();
  const images = client.gallery.get.getData();
  const initialIndex = images?.findIndex((item) => item.id === params.id) ?? 0;

  useEffect(() => {
    flatListRef.current?.scrollToOffset({
      offset: initialIndex * dimensions.width,
    });
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          title: "",
        }}
      />
      <FlatList
        ref={flatListRef}
        data={images}
        className="bg-background"
        contentContainerClassName="gap-4"
        snapToAlignment="center"
        snapToInterval={dimensions.width}
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
              height: dimensions.height - 100,
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ImageScalable source={{ uri: item?.thumbnail_url }} />
          </View>
        )}
      />
    </>
  );
}

function ImageScalable(props: { source: { uri: string } }) {
  const dimensions = Dimensions.get("window");
  const image = useQuery({
    queryKey: ["image-dimensions", props.source.uri],
    queryFn: async () => {
      return new Promise<{ width: number; height: number }>(
        (resolve, reject) => {
          Image.getSize(
            props.source.uri,
            (width, height) => {
              const scaleFactor = dimensions.width / width;
              width = dimensions.width;
              height = height * scaleFactor;

              resolve({ width, height });
            },
            (error) => {
              reject(error);
            },
          );
        },
      );
    },
  });

  return !image.isLoading ? (
    <Image
      source={props.source}
      style={{ width: image.data?.width, height: image.data?.height }}
    />
  ) : (
    <ActivityIndicator />
  );
}
