import { useSelectedImage } from "@/hooks/use_select_image";
import { useUpload } from "@/hooks/use_upload";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/trpc";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { launchImageLibraryAsync } from "expo-image-picker";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  View,
} from "react-native";
import { match, P } from "ts-pattern";
import { Button } from "../ui/button";
import { Text } from "../ui/text";

type ImageListProps = {
  albumId?: string;
};

export default function ImageList(props: ImageListProps) {
  const images = trpc.gallery.get.useQuery({ albumId: props.albumId });
  const imageWidth = Dimensions.get("window").width / 4 - 8; // 4 columns with some spacing
  const router = useRouter();
  const selectedImages = useSelectedImage((state) => state.selectedImages);
  const setSelectedImages = useSelectedImage(
    (state) => state.setSelectedImages,
  );
  const { upload } = useUpload();

  const onUpload = async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      upload(result.assets);
      router.replace("/(protected)/home/(tabs)/upload");
    }
  };

  return match(images)
    .with({ data: P.when((v) => v?.length === 0) }, () => (
      <View className="flex-1 justify-center items-center bg-background p-4">
        <Text className="text-center font-medium text-lg">
          Your gallery is empty.
          <br /> Add some images to get started!
        </Text>
        <Button className="mt-4" onPress={onUpload}>
          <Ionicons name="image" size={20} className="mr-2 text-white" />
          <Text>Add Images</Text>
        </Button>
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
          <Pressable
            onPress={() => {
              if (selectedImages.length > 0) {
                if (selectedImages.includes(item.id)) {
                  // Deselect image
                  setSelectedImages(
                    selectedImages.filter((id) => id !== item.id),
                  );
                } else {
                  // Select image
                  setSelectedImages([...selectedImages, item.id]);
                }
              } else {
                router.push({
                  pathname: "/gallery",
                  params: {
                    "#": item.id,
                    albumId: props.albumId,
                  },
                });
              }
            }}
            onLongPress={() => {
              if (selectedImages.length === 0) {
                setSelectedImages([item.id]);
              }
            }}
          >
            <View className="relative">
              {selectedImages.includes(item.id) && (
                <View className="absolute top-1 right-1 bg-blue-500 rounded-full w-5 h-5 items-center justify-center z-10">
                  <Text className="text-white font-medium text-xs">
                    {selectedImages.indexOf(item.id) + 1}
                  </Text>
                </View>
              )}
              <Image
                source={{ uri: item.thumbnail_url }}
                className={cn(
                  "aspect-square",
                  selectedImages.includes(item.id)
                    ? "opacity-50"
                    : "opacity-100",
                )}
                style={{ width: imageWidth }}
              />
            </View>
          </Pressable>
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
