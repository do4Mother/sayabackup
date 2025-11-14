import { trpc } from "@/trpc/trpc";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Text,
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
        contentContainerClassName="gap-4 items-center"
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
          <AntDesign name="cloud-download" size={22} />
          <Text className="text-xs font-semibold">Download</Text>
        </View>
        <View className="items-center justify-center">
          <Ionicons name="albums-outline" size={22} />
          <Text className="text-xs font-semibold">Add to Album</Text>
        </View>
        <View className="items-center justify-center">
          <Ionicons name="trash-outline" size={22} />
          <Text className="text-xs font-semibold">Delete</Text>
        </View>
      </View>
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
