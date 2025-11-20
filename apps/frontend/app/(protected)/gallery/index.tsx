import ImageDetail from "@/components/app/ImageDetail";
import { Text } from "@/components/ui/text";
import { Stack, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function GalleryDetailPage() {
  const { "#": hash } = useLocalSearchParams<{
    "#"?: string;
  }>();
  const search = new URLSearchParams(`#${hash}`);
  const id = search.get("#");
  const albumId = search.get("albumId");

  if (!id) {
    return (
      <>
        <Stack.Screen options={{ title: "Image Not Found" }} />
        <View className="bg-background flex-1 items-center justify-center">
          <Text className=" text-slate-500">Couldn&apos;t find image.</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "",
        }}
      />
      <ImageDetail imageId={id} albumId={albumId} />
    </>
  );
}
