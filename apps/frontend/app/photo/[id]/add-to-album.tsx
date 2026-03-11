import { trpc } from "@/trpc/trpc";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { twMerge } from "tailwind-merge";

export default function AddToAlbumScreen() {
	const router = useRouter();
	const { photoId: id } = useLocalSearchParams<{ photoId: string }>();
	const albums = trpc.album.get.useQuery();
	const photo = trpc.gallery.find.useQuery({ id });
	const updateMutation = trpc.gallery.update.useMutation();
	const trpcUtils = trpc.useUtils();

	const onAlbumPress = (albumId: string) => {
		const isAdded = photo.data?.album_id === albumId;
		updateMutation.mutate(
			{ id, albumId: isAdded ? null : albumId },
			{
				onSuccess: () => {
					trpcUtils.invalidate();
				},
			},
		);
	};

	return (
		<ScrollView className="flex-1 bg-neutral-900 px-4 pt-6">
			<View className="items-center pb-2">
				<View className="w-10 h-1 rounded-full bg-neutral-700" />
			</View>
			<Text className="text-white text-left text-2xl font-bold tracking-tight mb-6">
				Albums
			</Text>

			{albums.data?.map((album, idx) => (
				<Pressable
					key={album.id}
					className={twMerge(
						"flex-row items-center gap-4 mb-4 border-neutral-800 active:bg-neutral-900",
						idx !== 0 && "border-t pt-4",
					)}
					onPress={() => onAlbumPress(album.id)}
				>
					<Ionicons name="albums-outline" size={24} color="white" />
					<View className="flex-1">
						<Text className="text-white text-sm font-medium">{album.name}</Text>
						<Text className="text-neutral-500 text-xs mt-0.5">
							{album.total} photos
						</Text>
					</View>
					<Ionicons
						name={
							photo.data?.album_id === album.id
								? "checkmark-circle"
								: "add-circle-outline"
						}
						size={24}
						color={photo.data?.album_id === album.id ? "#10b981" : "#525252"}
					/>
				</Pressable>
			))}

			<Pressable
				className="flex-row items-center gap-4 mb-4 border-neutral-800 active:bg-neutral-900 border-t pt-4"
				onPress={() => router.replace("/album/create")}
			>
				<Ionicons
					name="add-circle-outline"
					size={24}
					className="text-amber-400"
				/>
				<Text className="text-amber-400 text-sm font-semibold">
					Create New Album
				</Text>
			</Pressable>
		</ScrollView>
	);
}
