import { useAlert } from "@/components/alert/AlertContext";
import CustomImage from "@/components/app/CustomImage";
import { Header } from "@/components/app/Header";
import {
	DropdownButton,
	DropdownButtonItem,
} from "@/components/button/DropdownButton";
import { trpc } from "@/trpc/trpc";
import { toast } from "@backpackapp-io/react-native-toast";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import {
	ActivityIndicator,
	FlatList,
	Pressable,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AlbumDetailScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { id } = useLocalSearchParams<{ id: string }>();
	const { alert } = useAlert();
	const trpcUtils = trpc.useUtils();
	const removeMutation = trpc.album.remove.useMutation();
	const album = trpc.album.find.useQuery({ id });
	const photos = trpc.gallery.get.useInfiniteQuery(
		{ albumId: id, limit: 27 },
		{ getNextPageParam: (lastPage) => lastPage.nextCursor },
	);
	const items = useMemo(
		() => photos.data?.pages.flatMap((page) => page.items) || [],
		[photos.data],
	);

	return (
		<View className="flex-1 bg-neutral-950" style={{ paddingTop: insets.top }}>
			{/* Header */}
			<Header
				leading={
					<View className="flex-1">
						<Text
							className="text-white text-lg font-bold leading-4"
							numberOfLines={1}
						>
							{album.data?.name}
						</Text>
						<Text className="text-neutral-500 text-xs mt-0.5">
							{album.data?.total} photos
						</Text>
					</View>
				}
				trailing={
					<DropdownButton
						align="right"
						variant="ghost"
						size="sm"
						icon={
							<Ionicons name="ellipsis-vertical" size={18} color="#a3a3a3" />
						}
					>
						<DropdownButtonItem
							destructive
							label="Delete Album"
							onPress={() => {
								alert(
									"Are you sure you want to delete this album?",
									"The album and all its photos will be permanently deleted.",
									[
										{
											text: "Cancel",
											style: "cancel",
										},
										{
											text: "Delete",
											style: "destructive",
											onPress: () => {
												removeMutation.mutate(
													{ id },
													{
														onSuccess: () => {
															toast.success("Album deleted");
															trpcUtils.gallery.get.invalidate();
															trpcUtils.album.getWithImage.invalidate();
															router.back();
														},
													},
												);
											},
										},
									],
								);
							}}
						/>
						<DropdownButtonItem label="Option 2" onPress={() => {}} />
					</DropdownButton>
				}
			/>

			{/* Photo Grid */}
			<FlatList
				data={items}
				keyExtractor={(item) => item.id}
				numColumns={3}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingHorizontal: 1, paddingBottom: 40 }}
				onEndReachedThreshold={0.2}
				onEndReached={() =>
					photos.hasNextPage &&
					!photos.isFetchingNextPage &&
					photos.fetchNextPage()
				}
				ListFooterComponent={
					photos.isFetchingNextPage ? (
						<ActivityIndicator size={"small"} />
					) : null
				}
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
