import CustomImage from "@/components/app/CustomImage";
import { trpc } from "@/trpc/trpc";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AlbumDetailScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { id } = useLocalSearchParams<{ id: string }>();
	const album = trpc.album.find.useQuery({ id });
	const photos = trpc.gallery.get.useInfiniteQuery(
		{ albumId: id, limit: 26 },
		{ getNextPageParam: (lastPage) => lastPage.nextCursor },
	);
	const items = useMemo(
		() => photos.data?.pages.flatMap((page) => page.items) || [],
		[photos.data],
	);

	return (
		<View className="flex-1 bg-neutral-950" style={{ paddingTop: insets.top }}>
			{/* Header */}
			<View className="flex-row items-center px-4 py-3 gap-3">
				<Pressable
					onPress={() => router.back()}
					className="w-10 h-10 items-center justify-center rounded-full active:bg-neutral-800"
				>
					<Ionicons name="arrow-back" size={20} color="#fff" />
				</Pressable>
				<View className="flex-1">
					<View className="flex-row items-center gap-2">
						<Text
							className="text-white text-lg font-bold leading-4"
							numberOfLines={1}
						>
							{album.data?.name}
						</Text>
					</View>
					<Text className="text-neutral-500 text-xs mt-0.5">
						{album.data?.total} photos
					</Text>
				</View>
				<Pressable className="w-10 h-10 rounded-full items-center justify-center ">
					<Ionicons name="ellipsis-vertical" size={18} color="#a3a3a3" />
				</Pressable>
			</View>

			{/* Photo Grid */}
			<FlatList
				data={items}
				keyExtractor={(item) => item.id}
				numColumns={3}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingHorizontal: 1, paddingBottom: 40 }}
				renderItem={({ item: photo }) => (
					<Pressable
						onPress={() =>
							router.push({
								pathname: "/photo/[id]",
								params: { id: photo.id, albumId: id },
							})
						}
						style={{
							width: "33.333%",
							aspectRatio: 1,
							padding: 1,
						}}
					>
						<CustomImage
							source={{ uri: photo.thumbnail_path }}
							className="w-full h-full"
						/>
					</Pressable>
				)}
			/>
		</View>
	);
}
