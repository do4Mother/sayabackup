import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ALBUM_DATA: Record<
	string,
	{ name: string; icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
	"1": { name: "Favorites", icon: "heart", color: "#ef4444" },
	"2": { name: "Screenshots", icon: "phone-portrait", color: "#3b82f6" },
	"3": { name: "Camera", icon: "camera", color: "#fbbf24" },
	"4": { name: "Downloads", icon: "download", color: "#22c55e" },
	"5": { name: "Travel 2025", icon: "airplane", color: "#a78bfa" },
	"6": { name: "Food & Recipes", icon: "restaurant", color: "#f97316" },
	"7": { name: "Work", icon: "briefcase", color: "#6b7280" },
	"8": { name: "Pets", icon: "paw", color: "#ec4899" },
};

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

function generateAlbumPhotos(albumId: string) {
	const seed = Number.parseInt(albumId, 10) || 1;
	const count = [24, 156, 892, 43, 267, 89, 34, 145][seed - 1] || 24;
	const displayCount = Math.min(count, 30);
	return Array.from({ length: displayCount }, (_, i) => ({
		id: `album-${albumId}-photo-${i}`,
		color: PHOTO_COLORS[(i + seed * 3) % PHOTO_COLORS.length],
	}));
}

export default function AlbumDetailScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { id } = useLocalSearchParams<{ id: string }>();

	const album = ALBUM_DATA[id ?? "1"] ?? {
		name: "Album",
		icon: "folder" as const,
		color: "#737373",
	};
	const photos = generateAlbumPhotos(id ?? "1");
	const totalCount =
		[24, 156, 892, 43, 267, 89, 34, 145][
			(Number.parseInt(id ?? "1", 10) || 1) - 1
		] ?? 24;

	return (
		<View className="flex-1 bg-neutral-950" style={{ paddingTop: insets.top }}>
			{/* Header */}
			<View className="flex-row items-center px-4 py-3 gap-3">
				<Pressable
					onPress={() => router.back()}
					className="w-10 h-10 rounded-full bg-neutral-900 items-center justify-center border border-neutral-800"
				>
					<Ionicons name="arrow-back" size={20} color="#fff" />
				</Pressable>
				<View className="flex-1">
					<View className="flex-row items-center gap-2">
						<Ionicons name={album.icon} size={16} color={album.color} />
						<Text className="text-white text-lg font-bold" numberOfLines={1}>
							{album.name}
						</Text>
					</View>
					<Text className="text-neutral-500 text-xs mt-0.5">
						{totalCount} photos
					</Text>
				</View>
				<Pressable className="w-10 h-10 rounded-full bg-neutral-900 items-center justify-center border border-neutral-800">
					<Ionicons name="ellipsis-vertical" size={18} color="#a3a3a3" />
				</Pressable>
			</View>

			{/* Sort / Filter Bar */}
			<View className="flex-row items-center px-5 py-2 gap-3 mb-2">
				<Pressable className="flex-row items-center bg-neutral-900 border border-neutral-800 rounded-full px-3 py-1.5 gap-1.5">
					<Ionicons name="calendar-outline" size={14} color="#a3a3a3" />
					<Text className="text-neutral-400 text-xs font-medium">Date</Text>
					<Ionicons name="chevron-down" size={12} color="#525252" />
				</Pressable>
				<Pressable className="flex-row items-center bg-neutral-900 border border-neutral-800 rounded-full px-3 py-1.5 gap-1.5">
					<Ionicons name="funnel-outline" size={14} color="#a3a3a3" />
					<Text className="text-neutral-400 text-xs font-medium">Filter</Text>
				</Pressable>
				<View className="flex-1" />
				<Text className="text-neutral-600 text-xs">
					Showing {photos.length} of {totalCount}
				</Text>
			</View>

			{/* Photo Grid */}
			<FlatList
				data={photos}
				keyExtractor={(item) => item.id}
				numColumns={3}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingHorizontal: 1, paddingBottom: 40 }}
				renderItem={({ item: photo }) => (
					<Pressable
						onPress={() =>
							router.push({
								pathname: "/photo/[id]",
								params: { id: photo.id },
							})
						}
						style={{
							width: "33.333%",
							aspectRatio: 1,
							padding: 1,
						}}
					>
						<View
							className="flex-1 items-center justify-center"
							style={{ backgroundColor: photo.color }}
						>
							<Ionicons name="image" size={22} color="rgba(255,255,255,0.25)" />
						</View>
					</Pressable>
				)}
			/>
		</View>
	);
}
