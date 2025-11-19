import ImageDetail from "@/components/app/ImageDetail";
import { Stack, useLocalSearchParams } from "expo-router";

export default function GalleryDetailPage() {
  const { albumId, id } = useLocalSearchParams<{
    id: string;
    albumId?: string;
  }>();

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
