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
import {
  FlatList,
  Image,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

type Media = {
  file: File;
  uri: string;
  thumbnail: Blob;
  mimeType: string;
  name: string;
  size: number;
  processedBytes: number;
};

export default function UploadTabpage() {
  const [media, setMedia] = useState<Media[]>([]);
  const uploadMutation = trpc.s3.upload.useMutation();
  const createGalleryMutation = trpc.gallery.create.useMutation();
  const clientUtils = trpc.useUtils();

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const selectedMedia: Media[] = await Promise.all(
        result.assets.map(async (asset) => {
          // resize image for thumbnail
          let uri = asset.uri;
          let thumbnailBlob: Blob | null = null;
          if (asset.mimeType?.startsWith("image")) {
            const manipulate = ImageManipulator.manipulate(asset.uri);
            const image = await manipulate.resize({ width: 200 }).renderAsync();
            const thumbnail = await image.saveAsync();
            thumbnailBlob = await fetch(thumbnail.uri).then((res) =>
              res.blob(),
            );
          }

          if (asset.mimeType?.startsWith("video")) {
            if (Platform.OS === "web") {
              const video = document.createElement("video");
              video.src = asset.uri;
              await new Promise((resolve) => {
                video.addEventListener("loadeddata", () => {
                  resolve(true);
                });
              });

              video.muted = true;
              video.currentTime = 1;
              await new Promise((resolve) =>
                video.addEventListener("seeked", () => resolve(true)),
              );

              const canvas = document.createElement("canvas");
              canvas.width = 200;
              canvas.height = (video.videoHeight / video.videoWidth) * 200;
              const ctx = canvas.getContext("2d");
              ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
              const image = canvas.toDataURL("image/jpg");
              uri = image;
              thumbnailBlob = await fetch(image).then((res) => res.blob());
            }
          }

          if (!thumbnailBlob) {
            throw new Error("fail generate thumbnail");
          }

          return {
            file: asset.file!,
            uri: uri,
            thumbnail: thumbnailBlob,
            mimeType: asset.mimeType || "image/jpeg",
            name: asset.fileName || `media-${Date.now()}`,
            size: asset.fileSize || 0,
            processedBytes: 0,
          };
        }),
      );

      setMedia((prev) => [...prev, ...selectedMedia]);

      const credentials = localStorage.getItem(S3_CREDENTIALS_STORAGE_KEY);

      /**
       * TODO: implement alert when credentials is not set
       */
      if (!credentials) return;

      for await (const media of selectedMedia) {
        const upload = await uploadMutation.mutateAsync({
          credentials: credentials,
          path: media.name,
          type: media.mimeType,
        });

        // upload thumbnail
        await axios.put(upload.thumbnail, media.thumbnail, {
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

            if (processedBytes === media.size) {
              // create gallery record when upload is complete
              createGalleryMutation.mutate(
                {
                  filePath: `general/${media.name}`,
                  thumbnailPath: `thumbnails/${media.name}`,
                },
                {
                  onSuccess() {
                    clientUtils.gallery.get.invalidate();
                  },
                },
              );
            }
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
