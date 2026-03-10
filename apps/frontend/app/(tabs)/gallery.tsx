import { useAlert } from "@/components/alert/AlertContext";
import CustomImage from "@/components/app/CustomImage";
import { Header } from "@/components/app/Header";
import { FloatingActionButton } from "@/components/button/FloatingActionButton";
import { useUpload } from "@/hooks/use-upload";
import { trpc } from "@/trpc/trpc";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import * as ImagePicker from "expo-image-picker";
import { launchImageLibraryAsync } from "expo-image-picker";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
	ActivityIndicator,
	Dimensions,
	FlatList,
	Pressable,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppRouterOutput } from "../../../backend/src/routers/routers";

type Photos = AppRouterOutput["gallery"]["get"]["items"];

function groupByDate(photos: Photos) {
	const map = new Map<string, Photos>();
	for (const photo of photos) {
		const existing =
			map.get(dayjs(photo.created_at).format("ddd, DD MMMM YYYY")) || [];
		existing.push(photo);
		map.set(dayjs(photo.created_at).format("ddd, DD MMMM YYYY"), existing);
	}
	return Array.from(map.entries()).map(([date, photos]) => ({ date, photos }));
}

export default function GalleryScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { upload } = useUpload();
	const { alert } = useAlert();
	const photos = trpc.gallery.get.useInfiniteQuery(
		{ limit: 27 },
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		},
	);
	const groups = useMemo(
		() => groupByDate(photos.data?.pages.flatMap((page) => page.items) || []),
		[photos.data],
	);

	const onPickImage = async () => {
		const permissionResult =
			await ImagePicker.requestMediaLibraryPermissionsAsync();

		if (!permissionResult.granted) {
			alert(
				"Permission required",
				"Permission to access the media library is required.",
			);
			return;
		}

		const result = await launchImageLibraryAsync({
			mediaTypes: ["images", "videos"],
			allowsMultipleSelection: true,
			quality: 1,
		});

		if (!result.canceled) {
			upload({
				images: result.assets,
			});
		}
	};

	return (
		<View className="flex-1 bg-neutral-950" style={{ paddingTop: insets.top }}>
			{/* Header */}
			<Header title="Gallery" />

			{/* Photo Grid */}
			<FlatList
				data={groups}
				keyExtractor={(item) => item.date}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 20 }}
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
				renderItem={({ item: group }) => (
					<View className="mb-6">
						{/* Date Header */}
						<View className="px-5 py-3">
							<Text className="text-neutral-400 text-xs font-semibold tracking-wider uppercase">
								{group.date}
							</Text>
						</View>
						{/* Photos Row */}
						<View
							className="flex-row flex-wrap justify-start"
							style={{ gap: 4 }}
						>
							{group.photos.map((photo) => (
								<Pressable
									key={photo.id}
									onPress={() =>
										router.push({
											pathname: "/photo/[id]",
											params: { id: photo.id },
										})
									}
								>
									<CustomImage
										source={{
											uri: photo.thumbnail_path,
										}}
										alt="image"
										style={{
											width: Dimensions.get("screen").width / 3 - 4,
											aspectRatio: 1,
										}}
										loading="lazy"
										cachePolicy={"memory-disk"}
									/>
								</Pressable>
							))}
						</View>
					</View>
				)}
			/>

			<FloatingActionButton
				variant="primary"
				icon={<Ionicons name="add" size={24} color="#fff" />}
				position="bottom-right"
				onPress={onPickImage}
			/>
		</View>
	);
}
