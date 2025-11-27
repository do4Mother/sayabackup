import { trpc } from "@/trpc/trpc";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useEvent } from "expo";
import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import { useRef, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { match } from "ts-pattern";
import { AppRouterOutput } from "../../../backend/src/routers/routers";

type Gallery = AppRouterOutput["gallery"]["get"]["items"][number];

type VideoPlayerProps = {
  item: Gallery;
};

export default function VideoPlayer(props: VideoPlayerProps) {
  const [showThumbnail, setShowThumbnail] = useState(true);
  const videoViewRef = useRef<VideoView>(null);
  const player = useVideoPlayer({ useCaching: true });
  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });
  const videoMutation = trpc.gallery.original.useMutation();

  const onPlayVideo = () => {
    setShowThumbnail(false);
    videoMutation.mutate(
      { id: props.item.id },
      {
        async onSuccess(data) {
          await player.replaceAsync({ uri: data });
        },
      },
    );
  };

  const togglePlay = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  return match(showThumbnail)
    .with(true, () => (
      <View className="relative w-full flex-1">
        <Image
          source={{ uri: props.item.thumbnail_url }}
          className="w-full flex-1"
          contentFit="contain"
          cachePolicy={"memory-disk"}
        />
        <Pressable
          onPress={onPlayVideo}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <Ionicons name="cloud-download-outline" size={48} color="white" />
        </Pressable>
      </View>
    ))
    .otherwise(() =>
      match(videoMutation.isPending)
        .with(true, () => (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ))
        .otherwise(() => (
          <View className="h-full relative">
            <Pressable onPress={togglePlay} className="h-full">
              <VideoView
                ref={videoViewRef}
                player={player}
                allowsFullscreen
                nativeControls={false}
                style={{ maxHeight: "100%", maxWidth: "100%" }}
              />
              {isPlaying ? null : (
                <Ionicons
                  name="play"
                  size={64}
                  color="white"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                />
              )}

              <Pressable
                onPress={() => {
                  videoViewRef.current?.enterFullscreen();
                }}
                className="absolute bottom-4 right-4"
              >
                <AntDesign name="fullscreen" size={28} color="white" />
              </Pressable>
            </Pressable>
          </View>
        )),
    );
}
