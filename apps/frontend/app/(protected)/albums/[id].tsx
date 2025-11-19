import HeaderImagePage from "@/components/app/HeaderImagePage";
import ImageList from "@/components/app/ImageList";
import { trpc } from "@/trpc/trpc";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";

export default function AlbumDetailPage() {
  const params = useLocalSearchParams();
  const album = trpc.album.find.useQuery({ id: params.id as string });

  return (
    <>
      <Stack.Screen
        options={{
          header: () => {
            return <HeaderImagePage title={album.data?.name ?? ""} />;
          },
        }}
      />
      <ImageList albumId={params.id as string} />
    </>
  );
}
