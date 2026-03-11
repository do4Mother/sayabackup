import { getVideo } from "@/s3/get-video";
import { trpc } from "@/trpc/trpc";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useVideoPlayer, VideoView } from "expo-video";
import { useState } from "react";
import { Pressable, View } from "react-native";
import CustomImage from "./CustomImage";

type VideoPlayerProps = {
	src?: string;
	thumnbnailPath?: string;
};

export function VideoPlayer(props: VideoPlayerProps) {
	const user = trpc.auth.me.useQuery();
	const key = user.data?.user.key ?? "";
	const [isPlaybackActive, setIsPlaybackActive] = useState(false);

	const video = useQuery({
		enabled: !!props.src,
		queryKey: ["custom-image", props.src],
		queryFn: async () => {
			const response = await getVideo({
				path: props.src ?? "",
				key: key,
			});

			return response;
		},
	});

	if (!isPlaybackActive || video.isLoading) {
		return (
			<View className="relative w-full h-full">
				<CustomImage
					source={{ uri: props.thumnbnailPath }}
					className="w-full h-full"
					contentFit="contain"
				/>

				<Pressable
					className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/50 items-center justify-center"
					onPress={() => {
						setIsPlaybackActive(true);
					}}
				>
					<Ionicons name="arrow-down" size={32} className="text-white" />
				</Pressable>
			</View>
		);
	}

	return <VideoPlayerSource src={video.data ?? ""} />;
}

function VideoPlayerSource({ src }: { src: string }) {
	const player = useVideoPlayer(src, (player) => player.play());

	return <VideoView player={player} className="w-full h-full" />;
}
