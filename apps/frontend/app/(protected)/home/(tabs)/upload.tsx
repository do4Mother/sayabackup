import ImageType from "@/assets/images/image-asset.png";
import VideoType from "@/assets/images/video-asset.png";
import Header from "@/components/app/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Text } from "@/components/ui/text";
import { useUpload } from "@/hooks/use_upload";
import { formatFileSize } from "@/lib/file_size";
import { Ionicons } from "@expo/vector-icons";
import { launchImageLibraryAsync } from "expo-image-picker";
import { Stack } from "expo-router";
import { cssInterop } from "nativewind";
import { Image, SectionList, View } from "react-native";
import { match, P } from "ts-pattern";

type Media = {
  id: string;
  file: File;
  uri: string;
  mimeType: string;
  name: string;
  size: number;
  processedBytes: number;
  abortController?: AbortController;
};

cssInterop(SectionList, { className: "style" });

export default function UploadTabpage() {
  const { upload, data: media, setData: setMedia } = useUpload();

  const pickMedia = async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      await upload(result.assets);
    }
  };

  const onCancelUpload = (mediaItem: Media) => {
    mediaItem.abortController?.abort();

    const newMedia = media.filter((item) => item.id !== mediaItem.id);
    setMedia(newMedia);
  };

  const onClearAll = () => {
    for (const mediaItem of media) {
      mediaItem.abortController?.abort();
    }
    setMedia([]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Upload",
          header: (props) => (
            <Header
              title={props.options.title ?? ""}
              disableBackButton
              variant="large"
              action={match(media.length === 0)
                .with(false, () => (
                  <Button variant="ghost" size={"icon"} onPress={pickMedia}>
                    <Ionicons name="add" size={22} />
                  </Button>
                ))
                .otherwise(() => null)}
            />
          ),
        }}
      />
      <View className="bg-background flex-1">
        {match(media.length === 0)
          .with(true, () => (
            <View className="flex-1 items-center justify-center gap-y-4">
              <Text className="font-medium text-lg">Share Your Moments ✨</Text>
              <Button onPress={pickMedia}>
                <Ionicons name="cloud-upload" size={22} color="white" />
                <Text>Choose file</Text>
              </Button>
            </View>
          ))
          .otherwise(() => (
            <SectionList
              sections={[{ data: media }]}
              className="xl:max-w-2xl mx-auto w-full hide-scrollbar"
              ListHeaderComponent={() => (
                <View className="items-end px-4">
                  <Button
                    className="gap-x-1"
                    variant={"ghost"}
                    onPress={onClearAll}
                  >
                    <Ionicons name="close" size={22} className="mt-0.5" />
                    <Text className="leading-none">Clear</Text>
                  </Button>
                </View>
              )}
              renderItem={({ item }) => (
                <Card className="gap-4 flex-row px-4 mx-4 mb-4">
                  <Image
                    source={match(item.mimeType)
                      .with(P.string.startsWith("image"), () => ImageType)
                      .with(P.string.startsWith("video"), () => VideoType)
                      .otherwise(() => ImageType)}
                    style={{ width: 60, height: "auto" }}
                  />
                  <View className="flex-1">
                    <CardHeader className="px-0 flex-1 flex-row">
                      <CardTitle className="leading-5 flex-1 break-all">
                        {item.name}
                      </CardTitle>
                      <Button
                        size="icon"
                        variant={"ghost"}
                        onPress={() => onCancelUpload(item)}
                      >
                        <Ionicons
                          name="trash"
                          className="text-red-500"
                          size={18}
                        />
                      </Button>
                    </CardHeader>
                    <CardContent className="px-0 mt-2">
                      <Progress
                        value={(item.processedBytes / item.size) * 100}
                        className="my-0"
                      />
                      <Text className="mt-1 text-sm">
                        {((item.processedBytes / item.size) * 100).toFixed(0)}%
                        ({formatFileSize(item.processedBytes)} of{" "}
                        {formatFileSize(item.size)})
                      </Text>
                    </CardContent>
                  </View>
                </Card>
              )}
            />
          ))}
      </View>
    </>
  );
}
