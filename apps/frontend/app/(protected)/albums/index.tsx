import HeaderImagePage from "@/components/app/HeaderImagePage";
import ImageList from "@/components/app/ImageList";
import { Text } from "@/components/ui/text";
import { trpc } from "@/trpc/trpc";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function AlbumDetailPage() {
  const { "#": hash } = useLocalSearchParams<{ "#"?: string }>();

  if (!hash) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <Text className=" text-slate-500">Couldn&apos;t find album.</Text>
      </View>
    );
  }

  const id = hash.substring(1);
  const album = trpc.album.find.useQuery({ id });

  return (
    <>
      <Stack.Screen
        options={{
          header: () => {
            return <HeaderImagePage title={album.data?.name ?? ""} />;
          },
        }}
      />
      <ImageList albumId={id} />
    </>
  );
}
