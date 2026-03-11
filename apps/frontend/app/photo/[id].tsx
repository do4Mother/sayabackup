import { useAlert } from "@/components/alert/AlertContext";
import CustomImage from "@/components/app/CustomImage";
import { trpc } from "@/trpc/trpc";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
	ActivityIndicator,
	Dimensions,
	FlatList,
	Modal,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const PHOTO_COLORS = [
	"#7c3aed",
	"#dc2626",
	"#059669",
	"#d97706",
	"#2563eb",
	"#db2777",
	"#0891b2",
	"#84cc16",
	"#6366f1",
	"#f97316",
	"#14b8a6",
	"#e11d48",
	"#8b5cf6",
	"#ea580c",
	"#06b6d4",
	"#22c55e",
];

function getPhotoColor(id: string): string {
	const match = id.match(/(\d+)$/);
	const num = match ? Number.parseInt(match[1], 10) : 0;
	return PHOTO_COLORS[num % PHOTO_COLORS.length];
}

const DUMMY_METADATA = {
	fileName: "IMG_20260305_142356.jpg",
	fileSize: "4.2 MB",
	dimensions: "4032 × 3024",
	camera: "Pixel 9 Pro",
	aperture: "f/1.7",
	shutterSpeed: "1/125s",
	iso: "ISO 64",
	focalLength: "6.81mm",
	dateTaken: "March 5, 2026 • 2:23 PM",
	location: "Bandung, Indonesia",
};

const DUMMY_ALBUMS_LIST = [
	{ id: "1", name: "Favorites", icon: "heart" as const, color: "#ef4444" },
	{ id: "3", name: "Camera", icon: "camera" as const, color: "#fbbf24" },
	{ id: "5", name: "Travel 2025", icon: "airplane" as const, color: "#a78bfa" },
	{
		id: "6",
		name: "Food & Recipes",
		icon: "restaurant" as const,
		color: "#f97316",
	},
	{ id: "8", name: "Pets", icon: "paw" as const, color: "#ec4899" },
];

export default function PhotoDetailScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { alert } = useAlert();
	const { id, albumId } = useLocalSearchParams<{
		id: string;
		albumId?: string;
	}>();
	const [showInfo, setShowInfo] = useState(false);
	const [isFavorite, setIsFavorite] = useState(false);
	const [showAlbumPicker, setShowAlbumPicker] = useState(false);
	const [showShareSheet, setShowShareSheet] = useState(false);
	const [showMoreMenu, setShowMoreMenu] = useState(false);
	const [addedToAlbums, setAddedToAlbums] = useState<string[]>([]);
	const flatListRef = useRef<FlatList>(null);
	const trpcUtils = trpc.useUtils();
	const removeMutation = trpc.gallery.remove.useMutation();
	const photos = trpc.gallery.get.useInfiniteQuery(
		{
			albumId: albumId,
			limit: 27,
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		},
	);
	const items = useMemo(
		() => photos.data?.pages.flatMap((page) => page.items) || [],
		[photos.data],
	);
	const photoColor = getPhotoColor(id ?? "0");

	const handleDelete = () => {
		alert(
			"Delete Photo",
			"This photo will be permanently deleted from your backup. This action cannot be undone.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: () => {
						removeMutation.mutate(
							{ id: id as string },
							{
								onSuccess: () => {
									trpcUtils.gallery.get.invalidate({ albumId });

									/**
									 * After deletion, we want to navigate to the next photo in the list. We find the index of the deleted photo, and if there's a next photo, we navigate to it. Otherwise, we go back to the album or gallery view.
									 */
									const deletedIndex = items.findIndex((p) => p.id === id);
									if (deletedIndex !== -1) {
										const nextPhoto =
											items[deletedIndex + 1] || items[deletedIndex - 1];
										if (nextPhoto) {
											flatListRef.current?.scrollToIndex({
												index: deletedIndex + 1,
												animated: true,
											});
										}
									}
								},
							},
						);
					},
				},
			],
		);
	};

	const handleShare = () => {
		setShowShareSheet(true);
	};

	const handleToggleAlbum = (albumId: string) => {
		setAddedToAlbums((prev) =>
			prev.includes(albumId)
				? prev.filter((a) => a !== albumId)
				: [...prev, albumId],
		);
	};

	const toggleInfo = () => {
		setShowInfo(!showInfo);
	};

	return (
		<View className="flex-1 bg-black">
			{/* Top Bar - over the photo */}
			<View
				className="absolute top-0 left-0 right-0 z-10 flex-row items-center justify-between px-4 py-3"
				style={{ paddingTop: insets.top + 8 }}
			>
				<Pressable
					onPress={() => router.back()}
					className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
				>
					<Ionicons name="arrow-back" size={22} color="#fff" />
				</Pressable>
				<View className="flex-row items-center gap-2">
					<Pressable
						onPress={handleShare}
						className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
					>
						<Ionicons name="share-outline" size={20} color="#fff" />
					</Pressable>
					<Pressable
						onPress={() => setShowMoreMenu(true)}
						className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
					>
						<Ionicons name="ellipsis-vertical" size={20} color="#fff" />
					</Pressable>
				</View>
			</View>

			{/* Photo Area */}
			<FlatList
				ref={flatListRef}
				data={items}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				keyExtractor={(item) => item.id}
				contentContainerClassName="gap-4"
				initialScrollIndex={items.findIndex((p) => p.id === id)}
				ListEmptyComponent={() => (
					<View className="flex-1 justify-center items-center">
						<ActivityIndicator size="large" />
					</View>
				)}
				getItemLayout={(_, index) => ({
					length: SCREEN_WIDTH + 16,
					offset: (SCREEN_WIDTH + 16) * index,
					index,
				})}
				snapToAlignment="center"
				onScroll={(e) => {
					/**
					 * load pagination when user scrolls near the end of the list.
					 * We check if the current scroll position + screen width is within SCREEN_WIDTH * 2 of the end of the content,
					 * and if so, we trigger loading the next page.
					 */
					const scrollPosition = e.nativeEvent.contentOffset.x;
					const contentWidth = e.nativeEvent.contentSize.width;
					if (
						scrollPosition + SCREEN_WIDTH >= contentWidth - SCREEN_WIDTH * 2 &&
						photos.hasNextPage &&
						!photos.isFetchingNextPage
					) {
						photos.fetchNextPage();
					}
				}}
				renderItem={({ item }) => (
					<View
						className="flex-1 justify-center items-center"
						style={{
							width: SCREEN_WIDTH,
							height: SCREEN_HEIGHT,
						}}
					>
						<CustomImage
							source={{ uri: item.thumbnail_path }}
							className="w-full h-full"
							contentFit="contain"
						/>
					</View>
				)}
			/>

			{/* Bottom Bar */}
			<View
				className="bg-neutral-950 border-t border-neutral-900"
				style={{ paddingBottom: insets.bottom }}
			>
				{/* Action Buttons */}
				<View className="flex-row items-center justify-around py-3 px-6">
					<Pressable
						onPress={() => setIsFavorite(!isFavorite)}
						className="items-center gap-1"
					>
						<Ionicons
							name={isFavorite ? "heart" : "heart-outline"}
							size={24}
							color={isFavorite ? "#ef4444" : "#a3a3a3"}
						/>
						<Text
							className={`text-[10px] tracking-wider ${isFavorite ? "text-red-400" : "text-neutral-500"}`}
						>
							LIKE
						</Text>
					</Pressable>

					<Pressable
						onPress={() => setShowAlbumPicker(true)}
						className="items-center gap-1"
					>
						<Ionicons
							name={addedToAlbums.length > 0 ? "albums" : "albums-outline"}
							size={24}
							color={addedToAlbums.length > 0 ? "#3b82f6" : "#a3a3a3"}
						/>
						<Text
							className={`text-[10px] tracking-wider ${addedToAlbums.length > 0 ? "text-blue-400" : "text-neutral-500"}`}
						>
							ALBUM
						</Text>
					</Pressable>

					<Pressable onPress={toggleInfo} className="items-center gap-1">
						<Ionicons
							name={
								showInfo ? "information-circle" : "information-circle-outline"
							}
							size={24}
							color={showInfo ? "#fbbf24" : "#a3a3a3"}
						/>
						<Text
							className={`text-[10px] tracking-wider ${showInfo ? "text-amber-400" : "text-neutral-500"}`}
						>
							INFO
						</Text>
					</Pressable>

					<Pressable onPress={handleDelete} className="items-center gap-1">
						<Ionicons name="trash-outline" size={24} color="#a3a3a3" />
						<Text className="text-neutral-500 text-[10px] tracking-wider">
							DELETE
						</Text>
					</Pressable>
				</View>

				{/* Info Panel */}
				{showInfo && (
					<ScrollView className="border-t border-neutral-900 max-h-72">
						<View className="px-5 py-4 gap-4">
							{/* Date & Location */}
							<View>
								<View className="flex-row items-center gap-2 mb-1">
									<Ionicons name="calendar-outline" size={14} color="#fbbf24" />
									<Text className="text-white text-sm font-medium">
										{DUMMY_METADATA.dateTaken}
									</Text>
								</View>
								<View className="flex-row items-center gap-2">
									<Ionicons name="location-outline" size={14} color="#fbbf24" />
									<Text className="text-neutral-400 text-sm">
										{DUMMY_METADATA.location}
									</Text>
								</View>
							</View>

							{/* File Info */}
							<View className="bg-neutral-900 rounded-xl p-4">
								<Text className="text-neutral-500 text-xs font-semibold tracking-wider uppercase mb-3">
									File Details
								</Text>
								<View className="gap-2.5">
									<InfoRow label="Name" value={DUMMY_METADATA.fileName} />
									<InfoRow label="Size" value={DUMMY_METADATA.fileSize} />
									<InfoRow
										label="Dimensions"
										value={DUMMY_METADATA.dimensions}
									/>
								</View>
							</View>

							{/* Camera Info */}
							<View className="bg-neutral-900 rounded-xl p-4">
								<Text className="text-neutral-500 text-xs font-semibold tracking-wider uppercase mb-3">
									Camera
								</Text>
								<View className="flex-row items-center gap-3 mb-3">
									<View className="w-9 h-9 rounded-lg bg-neutral-800 items-center justify-center">
										<Ionicons name="camera" size={18} color="#fbbf24" />
									</View>
									<Text className="text-white text-sm font-medium">
										{DUMMY_METADATA.camera}
									</Text>
								</View>
								<View className="flex-row flex-wrap gap-2">
									<MetadataChip value={DUMMY_METADATA.aperture} />
									<MetadataChip value={DUMMY_METADATA.shutterSpeed} />
									<MetadataChip value={DUMMY_METADATA.iso} />
									<MetadataChip value={DUMMY_METADATA.focalLength} />
								</View>
							</View>

							{/* Backup Status */}
							<View className="bg-emerald-950/50 border border-emerald-900/50 rounded-xl p-4 flex-row items-center gap-3">
								<Ionicons name="cloud-done" size={20} color="#10b981" />
								<View>
									<Text className="text-emerald-400 text-sm font-medium">
										Backed up
									</Text>
									<Text className="text-emerald-700 text-xs mt-0.5">
										Synced on March 5, 2026
									</Text>
								</View>
							</View>
						</View>
					</ScrollView>
				)}
			</View>

			{/* Album Picker Modal */}
			<Modal
				visible={showAlbumPicker}
				transparent
				animationType="slide"
				onRequestClose={() => setShowAlbumPicker(false)}
			>
				<Pressable
					className="flex-1 bg-black/60"
					onPress={() => setShowAlbumPicker(false)}
				/>
				<View
					className="bg-neutral-950 rounded-t-3xl border-t border-neutral-800"
					style={{ paddingBottom: insets.bottom + 16 }}
				>
					<View className="items-center pt-3 pb-1">
						<View className="w-10 h-1 rounded-full bg-neutral-700" />
					</View>
					<View className="flex-row items-center justify-between px-5 py-3">
						<Text className="text-white text-lg font-bold">Add to Album</Text>
						<Pressable onPress={() => setShowAlbumPicker(false)}>
							<Ionicons name="close" size={24} color="#737373" />
						</Pressable>
					</View>
					<ScrollView className="max-h-80">
						{DUMMY_ALBUMS_LIST.map((album) => {
							const isAdded = addedToAlbums.includes(album.id);
							return (
								<Pressable
									key={album.id}
									onPress={() => handleToggleAlbum(album.id)}
									className="flex-row items-center px-5 py-3.5 active:bg-neutral-900"
								>
									<View
										className="w-10 h-10 rounded-xl items-center justify-center mr-3"
										style={{
											backgroundColor: isAdded
												? album.color
												: `${album.color}20`,
										}}
									>
										<Ionicons
											name={album.icon}
											size={18}
											color={isAdded ? "#fff" : album.color}
										/>
									</View>
									<Text className="flex-1 text-white text-sm font-medium">
										{album.name}
									</Text>
									<Ionicons
										name={isAdded ? "checkmark-circle" : "add-circle-outline"}
										size={24}
										color={isAdded ? "#10b981" : "#525252"}
									/>
								</Pressable>
							);
						})}
						{/* Create new album */}
						<Pressable
							onPress={() => {
								setShowAlbumPicker(false);
								alert("New Album", "Create album feature coming soon.");
							}}
							className="flex-row items-center px-5 py-3.5 active:bg-neutral-900 border-t border-neutral-900"
						>
							<View className="w-10 h-10 rounded-xl items-center justify-center mr-3 bg-amber-400/10">
								<Ionicons name="add" size={20} color="#fbbf24" />
							</View>
							<Text className="flex-1 text-amber-400 text-sm font-medium">
								Create New Album
							</Text>
						</Pressable>
					</ScrollView>
				</View>
			</Modal>

			{/* Share Sheet Modal */}
			<Modal
				visible={showShareSheet}
				transparent
				animationType="slide"
				onRequestClose={() => setShowShareSheet(false)}
			>
				<Pressable
					className="flex-1 bg-black/60"
					onPress={() => setShowShareSheet(false)}
				/>
				<View
					className="bg-neutral-950 rounded-t-3xl border-t border-neutral-800"
					style={{ paddingBottom: insets.bottom + 16 }}
				>
					<View className="items-center pt-3 pb-1">
						<View className="w-10 h-1 rounded-full bg-neutral-700" />
					</View>
					<View className="flex-row items-center justify-between px-5 py-3">
						<Text className="text-white text-lg font-bold">Share</Text>
						<Pressable onPress={() => setShowShareSheet(false)}>
							<Ionicons name="close" size={24} color="#737373" />
						</Pressable>
					</View>

					{/* Share preview */}
					<View className="flex-row items-center mx-5 mb-4 bg-neutral-900 rounded-xl p-3 gap-3">
						<View
							className="w-12 h-12 rounded-lg items-center justify-center"
							style={{ backgroundColor: photoColor }}
						>
							<Ionicons name="image" size={18} color="rgba(255,255,255,0.3)" />
						</View>
						<View className="flex-1">
							<Text
								className="text-white text-sm font-medium"
								numberOfLines={1}
							>
								{DUMMY_METADATA.fileName}
							</Text>
							<Text className="text-neutral-500 text-xs mt-0.5">
								{DUMMY_METADATA.fileSize} • {DUMMY_METADATA.dimensions}
							</Text>
						</View>
					</View>

					{/* Share options */}
					<View className="flex-row justify-around px-5 py-2">
						{[
							{
								icon: "link-outline" as const,
								label: "Copy Link",
								color: "#3b82f6",
							},
							{
								icon: "copy-outline" as const,
								label: "Copy",
								color: "#a78bfa",
							},
							{
								icon: "download-outline" as const,
								label: "Save",
								color: "#22c55e",
							},
							{
								icon: "mail-outline" as const,
								label: "Email",
								color: "#f97316",
							},
						].map((opt) => (
							<Pressable
								key={opt.label}
								onPress={() => {
									setShowShareSheet(false);
									alert(opt.label, `${opt.label} action triggered. (Demo)`);
								}}
								className="items-center gap-2"
							>
								<View className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 items-center justify-center">
									<Ionicons name={opt.icon} size={24} color={opt.color} />
								</View>
								<Text className="text-neutral-400 text-[10px] tracking-wider">
									{opt.label}
								</Text>
							</Pressable>
						))}
					</View>
				</View>
			</Modal>

			{/* More Menu Modal */}
			<Modal
				visible={showMoreMenu}
				transparent
				animationType="fade"
				onRequestClose={() => setShowMoreMenu(false)}
			>
				<Pressable
					className="flex-1 bg-black/60"
					onPress={() => setShowMoreMenu(false)}
				/>
				<View
					className="bg-neutral-950 rounded-t-3xl border-t border-neutral-800"
					style={{ paddingBottom: insets.bottom + 16 }}
				>
					<View className="items-center pt-3 pb-1">
						<View className="w-10 h-1 rounded-full bg-neutral-700" />
					</View>

					{[
						{
							icon: "download-outline" as const,
							label: "Download Original",
							color: "#22c55e",
						},
						{
							icon: "cloud-upload-outline" as const,
							label: "Re-upload to Backup",
							color: "#3b82f6",
						},
						{
							icon: "image-outline" as const,
							label: "Set as Wallpaper",
							color: "#a78bfa",
						},
						{
							icon: "qr-code-outline" as const,
							label: "Show QR Code",
							color: "#fbbf24",
						},
						{
							icon: "print-outline" as const,
							label: "Print",
							color: "#f97316",
						},
						{
							icon: "flag-outline" as const,
							label: "Report an Issue",
							color: "#ef4444",
						},
					].map((opt) => (
						<Pressable
							key={opt.label}
							onPress={() => {
								setShowMoreMenu(false);
								alert(opt.label, `${opt.label} feature coming soon. (Demo)`);
							}}
							className="flex-row items-center px-5 py-3.5 active:bg-neutral-900"
						>
							<View className="w-9 h-9 rounded-xl items-center justify-center mr-3 bg-neutral-900">
								<Ionicons name={opt.icon} size={18} color={opt.color} />
							</View>
							<Text className="text-white text-sm font-medium">
								{opt.label}
							</Text>
						</Pressable>
					))}
				</View>
			</Modal>
		</View>
	);
}

function InfoRow({ label, value }: { label: string; value: string }) {
	return (
		<View className="flex-row items-center justify-between">
			<Text className="text-neutral-500 text-xs">{label}</Text>
			<Text className="text-neutral-300 text-xs font-medium">{value}</Text>
		</View>
	);
}

function MetadataChip({ value }: { value: string }) {
	return (
		<View className="bg-neutral-800 rounded-lg px-3 py-1.5">
			<Text className="text-neutral-300 text-xs font-medium">{value}</Text>
		</View>
	);
}
