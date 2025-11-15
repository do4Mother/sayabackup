import { trpc } from "@/trpc/trpc";
import { Link } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  View,
} from "react-native";
import { match, P } from "ts-pattern";
import { Text } from "../ui/text";

type ImageListProps = {
  albumId?: string;
};

export default function ImageList(props: ImageListProps) {
  const images = trpc.gallery.get.useQuery({ albumId: props.albumId });
  const imageWidth = Dimensions.get("window").width / 4 - 8; // 4 columns with some spacing

  return match(images)
    .with({ data: P.when((v) => v?.length === 0) }, () => (
      <View className="flex-1 justify-center items-center bg-background">
        <Text>No images found</Text>
      </View>
    ))
    .with({ data: P.when((v) => (v?.length ?? 0) > 0) }, () => (
      <FlatList
        data={images.data}
        numColumns={4}
        className="py-4 px-1 bg-background"
        contentContainerClassName="gap-y-4"
        columnWrapperClassName="gap-2"
        renderItem={({ item }) => (
          <Link
            href={{
              pathname: "/gallery/[id]",
              params: {
                id: item.id,
                albumId: props.albumId,
              },
            }}
            asChild
          >
            <Image
              source={{ uri: item.thumbnail_url }}
              className="aspect-square"
              style={{ width: imageWidth }}
            />
          </Link>
        )}
      />
    ))
    .with({ isError: true }, () => (
      <View className="flex-1 items-center justify-center p-4 bg-background">
        <Text>{images.error?.message}</Text>
      </View>
    ))
    .otherwise(() => (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    ));
}
