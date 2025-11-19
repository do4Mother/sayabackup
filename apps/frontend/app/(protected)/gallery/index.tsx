import ImageDetail from "@/components/app/ImageDetail";
import { Text } from "@/components/ui/text";
import { Stack, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function GalleryDetailPage() {
  const { albumId, "#": hash } = useLocalSearchParams<{
    "#"?: string;
    albumId?: string;
  }>();

  if (!hash) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <Text className=" text-slate-500">Couldn&apos;t find image.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "",
        }}
      />
      <ImageDetail imageId={hash} albumId={albumId} />
    </>
  );
}
