import Heading from "@/components/app/Heading";
import FloatingActionButton from "@/components/buttons/FloatingActionButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { S3_CREDENTIALS_STORAGE_KEY } from "@/lib/constant";
import { formatFileSize } from "@/lib/file_size";
import { trpc } from "@/trpc/trpc";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import axios from "axios";
import { ImageManipulator } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { FlatList, Image, ScrollView, Text, View } from "react-native";

type Media = {
  file: File;
  uri: string;
  mimeType: string;
  name: string;
  size: number;
  processedBytes: number;
};

export default function UploadTabpage() {
  const [media, setMedia] = useState<Media[]>([]);
  const uploadMutation = trpc.s3.upload.useMutation();

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const selectedMedia: Media[] = result.assets.map((asset) => ({
        file: asset.file!,
        uri: asset.uri,
        mimeType: asset.mimeType || "image/jpeg",
        name: asset.fileName || `media-${Date.now()}`,
        size: asset.fileSize || 0,
        processedBytes: 0,
      }));
      setMedia((prevMedia) => [...prevMedia, ...selectedMedia]);

      const credentials = localStorage.getItem(S3_CREDENTIALS_STORAGE_KEY);

      /**
       * TODO: implement alert when credentials is not set
       */
      if (!credentials) return;

      for await (const media of selectedMedia) {
        const upload = await uploadMutation.mutateAsync({
          credentials: credentials,
          path: `/general/${media.name}`,
          type: media.mimeType,
        });

        // resize image for thumbnail
        const manipulate = ImageManipulator.manipulate(media.uri);
        const image = await manipulate.resize({ width: 200 }).renderAsync();
        const thumbnail = await image.saveAsync();
        const thumbnailBlob = await fetch(thumbnail.uri).then((res) =>
          res.blob(),
        );

        // upload thumbnail
        await axios.put(upload.thumbnail, thumbnailBlob, {
          headers: {
            "Content-Type": media.mimeType,
          },
        });

        // upload original file with progress tracking
        await axios.put(upload.original, media.file, {
          headers: {
            "Content-Type": media.mimeType,
          },
          onUploadProgress: (progressEvent) => {
            const processedBytes = progressEvent.loaded;
            setMedia((prevMedia) =>
              prevMedia.map((m) =>
                m.uri === media.uri ? { ...m, processedBytes } : m,
              ),
            );
          },
        });
      }
    }
  };

  return (
    <View className="bg-background flex-1">
      <FloatingActionButton
        label="Upload"
        icon={<FontAwesome6 name="upload" size={16} />}
        onPress={pickMedia}
      />

      <ScrollView>
        <Heading title="Upload" />
        <FlatList
          data={media}
          contentContainerClassName="gap-4 px-4 mt-4"
          renderItem={({ item }) => (
            <Card className="gap-4 flex-row px-4">
              <Image
                source={{
                  uri: item.uri,
                }}
                className="size-20 rounded-md"
              />
              <View className="flex-1">
                <CardHeader className="px-0 flex-1">
                  <CardTitle className="leading-5">{item.name}</CardTitle>
                </CardHeader>
                <CardContent className="px-0 mt-2">
                  <Progress
                    value={(item.processedBytes / item.size) * 100}
                    className="my-0"
                  />
                  <Text className="mt-1">
                    {((item.processedBytes / item.size) * 100).toFixed(0)}% (
                    {formatFileSize(item.processedBytes)} of{" "}
                    {formatFileSize(item.size)})
                  </Text>
                </CardContent>
              </View>
            </Card>
          )}
        />
      </ScrollView>
    </View>
  );
}
