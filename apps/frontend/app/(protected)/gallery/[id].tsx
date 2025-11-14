import ImageDetail from "@/components/app/ImageDetail";
import { Stack, useLocalSearchParams } from "expo-router";

export default function GalleryDetailPage() {
  const { albumId } = useLocalSearchParams();

  return (
    <>
      <Stack.Screen
        options={{
          title: "",
        }}
      />
      <ImageDetail albumId={albumId as string | undefined} />
    </>
  );
}
