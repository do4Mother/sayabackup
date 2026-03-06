import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DUMMY_PHOTOS = Array.from({ length: 48 }, (_, i) => ({
	id: `photo-${i}`,
	color: [
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
	][i % 16],
	date: new Date(2026, 2, 6 - Math.floor(i / 6)).toLocaleDateString("en-US", {
		weekday: "long",
		month: "short",
		day: "numeric",
	}),
}));

type DateGroup = {
	date: string;
	photos: typeof DUMMY_PHOTOS;
};

function groupByDate(photos: typeof DUMMY_PHOTOS): DateGroup[] {
	const map = new Map<string, typeof DUMMY_PHOTOS>();
	for (const photo of photos) {
		const existing = map.get(photo.date) || [];
		existing.push(photo);
		map.set(photo.date, existing);
	}
	return Array.from(map.entries()).map(([date, photos]) => ({ date, photos }));
}

export default function GalleryScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const [viewMode, setViewMode] = useState<"grid" | "compact">("grid");
	const groups = groupByDate(DUMMY_PHOTOS);

	const numColumns = viewMode === "grid" ? 3 : 4;
	const gap = viewMode === "grid" ? 2 : 1;

	return (
		<View className="flex-1 bg-neutral-950" style={{ paddingTop: insets.top }}>
			{/* Header */}
			<View className="flex-row items-center justify-between px-5 py-4">
				<View>
					<Text className="text-white text-2xl font-bold tracking-tight">
						Gallery
					</Text>
					<Text className="text-neutral-500 text-xs mt-1 tracking-wide">
						48 photos • 2.4 GB
					</Text>
				</View>
				<View className="flex-row items-center gap-4">
					<Pressable
						onPress={() =>
							setViewMode(viewMode === "grid" ? "compact" : "grid")
						}
					>
						<Ionicons
							name={viewMode === "grid" ? "grid-outline" : "grid"}
							size={20}
							color="#a3a3a3"
						/>
					</Pressable>
					<Pressable>
						<Ionicons name="search-outline" size={20} color="#a3a3a3" />
					</Pressable>
				</View>
			</View>

			{/* Photo Grid */}
			<FlatList
				data={groups}
				keyExtractor={(item) => item.date}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 20 }}
				renderItem={({ item: group }) => (
					<View className="mb-6">
						{/* Date Header */}
						<View className="px-5 py-3">
							<Text className="text-neutral-400 text-xs font-semibold tracking-wider uppercase">
								{group.date}
							</Text>
						</View>
						{/* Photos Row */}
						<View className="flex-row flex-wrap" style={{ gap }}>
							{group.photos.map((photo) => (
								<Pressable
									key={photo.id}
									onPress={() =>
										router.push({
											pathname: "/photo/[id]",
											params: { id: photo.id },
										})
									}
									style={{
										width: `${100 / numColumns}%`,
										aspectRatio: 1,
										padding: gap / 2,
									}}
								>
									<View
										className="flex-1 rounded-sm items-center justify-center"
										style={{ backgroundColor: photo.color }}
									>
										<Ionicons
											name="image"
											size={24}
											color="rgba(255,255,255,0.3)"
										/>
									</View>
								</Pressable>
							))}
						</View>
					</View>
				)}
			/>

			{/* Floating Backup Status */}
			<View
				className="absolute bottom-4 left-5 right-5 bg-neutral-900 border border-neutral-800 rounded-2xl px-5 py-3 flex-row items-center"
				style={{ marginBottom: 4 }}
			>
				<View className="w-8 h-8 rounded-full bg-emerald-500/20 items-center justify-center mr-3">
					<Ionicons name="checkmark-circle" size={18} color="#10b981" />
				</View>
				<View className="flex-1">
					<Text className="text-white text-sm font-medium">
						Backup complete
					</Text>
					<Text className="text-neutral-500 text-xs mt-0.5">
						All photos synced
					</Text>
				</View>
				<Ionicons name="chevron-forward" size={16} color="#525252" />
			</View>
		</View>
	);
}
