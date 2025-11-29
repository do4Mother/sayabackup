import { useSelectedImage } from "@/hooks/use_select_image";
import { useUpload } from "@/hooks/use_upload";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/trpc";
import { Ionicons } from "@expo/vector-icons";
import { launchImageLibraryAsync } from "expo-image-picker";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";
import { match, P } from "ts-pattern";
import CustomImage from "../images/CustomImage";
import { Button } from "../ui/button";
import { Text } from "../ui/text";
import HeaderImagePage from "./HeaderImagePage";

type ImageListProps = {
  albumId?: string;
};

export default function ImageList(props: ImageListProps) {
  const images = trpc.gallery.get.useInfiniteQuery(
    { albumId: props.albumId, limit: 8 * 4 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );
  const [responsiveLayout, setResponsiveLayout] = useState<ResponsiveLayout>(
    createResponsiveLayout({ width: 0 }),
  );
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
      upload(result.assets, props.albumId);
      router.replace("/(protected)/home/(tabs)/upload");
    }
  };

  return (
    <>
      <Stack.Screen
        options={match(selectedImages.length)
          .when(
            (v) => v > 0,
            () => {
              const imageComponent = () => <HeaderImagePage />;
              return {
                headerShown: true,
                header: imageComponent,
              };
            },
          )
          .otherwise(() => ({ header: undefined }))}
      />

      {match(images)
        .with({ data: P.when((v) => v?.pages?.length === 0) }, () => (
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
        .with({ data: P.when((v) => (v?.pages?.length ?? 0) > 0) }, (value) => (
          <FlatList
            key={responsiveLayout.numOfColumns}
            data={value.data?.pages.flatMap((page) => page.items) ?? []}
            numColumns={responsiveLayout.numOfColumns}
            className="py-4 px-4 bg-background items-center hide-scrollbar"
            contentContainerClassName="gap-y-4"
            columnWrapperStyle={{
              gap: responsiveLayout.spacing,
              justifyContent: "flex-start",
            }}
            onLayout={(event) => {
              setResponsiveLayout(
                createResponsiveLayout({
                  width: event.nativeEvent.layout.width,
                }),
              );
            }}
            onEndReachedThreshold={0.2}
            onEndReached={() =>
              images.hasNextPage &&
              !images.isFetchingNextPage &&
              images.fetchNextPage()
            }
            ListFooterComponent={
              images.isFetchingNextPage ? (
                <ActivityIndicator size={"small"} />
              ) : null
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  if (selectedImages.length > 0) {
                    if (selectedImages.includes(item)) {
                      // Deselect image
                      setSelectedImages(
                        selectedImages.filter((image) => image.id !== item.id),
                      );
                    } else {
                      // Select image
                      setSelectedImages([...selectedImages, item]);
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
                    setSelectedImages([item]);
                  }
                }}
              >
                <View className="relative">
                  {selectedImages.includes(item) && (
                    <View className="absolute top-1 right-1 bg-blue-500 rounded-full w-5 h-5 items-center justify-center z-10">
                      <Text className="text-white font-medium text-xs">
                        {selectedImages.indexOf(item) + 1}
                      </Text>
                    </View>
                  )}
                  <CustomImage
                    source={{ uri: item.thumbnail_path }}
                    className={cn(
                      "aspect-square",
                      selectedImages.includes(item)
                        ? "opacity-50"
                        : "opacity-100",
                    )}
                    style={{ width: responsiveLayout.imageWidth - 8 }}
                    cachePolicy={"memory-disk"}
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
        ))}
    </>
  );
}

type ResponsiveLayout = ReturnType<typeof createResponsiveLayout>;

function createResponsiveLayout(props: { width: number }) {
  if (props.width > 900) {
    const spacing = (8 * 7) / 8; // 8px gap between 8 columns
    return {
      numOfColumns: 8,
      spacing,
      imageWidth: props.width / 8 - spacing,
    };
  }

  if (props.width > 750) {
    const spacing = (8 * 5) / 6; // 8px gap between 6 columns
    return {
      numOfColumns: 6,
      spacing,
      imageWidth: props.width / 6 - spacing,
    };
  }

  if (props.width > 600) {
    const spacing = (8 * 4) / 5; // 8px gap between 5 columns
    return {
      numOfColumns: 5,
      spacing,
      imageWidth: props.width / 5 - spacing,
    };
  }
  if (props.width > 350) {
    const spacing = (8 * 3) / 4; // 8px gap between 4 columns
    return {
      numOfColumns: 4,
      spacing,
      imageWidth: props.width / 4 - spacing,
    };
  }
  const spacing = (8 * 1) / 2; // 8px gap between 2 columns

  return {
    numOfColumns: 2,
    spacing,
    imageWidth: props.width / 2 - spacing,
  };
}
