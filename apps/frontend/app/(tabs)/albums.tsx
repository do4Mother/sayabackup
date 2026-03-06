import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DUMMY_ALBUMS = [
	{
		id: "1",
		name: "Favorites",
		count: 24,
		icon: "heart" as const,
		color: "#ef4444",
		bgColor: "#450a0a",
	},
	{
		id: "2",
		name: "Screenshots",
		count: 156,
		icon: "phone-portrait" as const,
		color: "#3b82f6",
		bgColor: "#172554",
	},
	{
		id: "3",
		name: "Camera",
		count: 892,
		icon: "camera" as const,
		color: "#fbbf24",
		bgColor: "#451a03",
	},
	{
		id: "4",
		name: "Downloads",
		count: 43,
		icon: "download" as const,
		color: "#22c55e",
		bgColor: "#052e16",
	},
	{
		id: "5",
		name: "Travel 2025",
		count: 267,
		icon: "airplane" as const,
		color: "#a78bfa",
		bgColor: "#2e1065",
	},
	{
		id: "6",
		name: "Food & Recipes",
		count: 89,
		icon: "restaurant" as const,
		color: "#f97316",
		bgColor: "#431407",
	},
	{
		id: "7",
		name: "Work",
		count: 34,
		icon: "briefcase" as const,
		color: "#6b7280",
		bgColor: "#1f2937",
	},
	{
		id: "8",
		name: "Pets",
		count: 145,
		icon: "paw" as const,
		color: "#ec4899",
		bgColor: "#500724",
	},
];

const COVER_COLORS = [
	["#7c3aed", "#6366f1", "#8b5cf6", "#a78bfa"],
	["#2563eb", "#0891b2", "#06b6d4", "#3b82f6"],
	["#d97706", "#f97316", "#fbbf24", "#ea580c"],
	["#059669", "#22c55e", "#14b8a6", "#84cc16"],
	["#dc2626", "#e11d48", "#ef4444", "#f43f5e"],
	["#db2777", "#ec4899", "#f472b6", "#be185d"],
	["#6b7280", "#9ca3af", "#4b5563", "#71717a"],
	["#a78bfa", "#c084fc", "#d8b4fe", "#8b5cf6"],
];

function AlbumCover({ colors }: { colors: string[] }) {
	return (
		<View className="w-full aspect-square rounded-xl overflow-hidden flex-row flex-wrap">
			{colors.map((c) => (
				<View
					key={c}
					className="items-center justify-center"
					style={{ width: "50%", height: "50%", backgroundColor: c }}
				>
					<Ionicons name="image" size={16} color="rgba(255,255,255,0.2)" />
				</View>
			))}
		</View>
	);
}

export default function AlbumsScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();

	return (
		<View className="flex-1 bg-neutral-950" style={{ paddingTop: insets.top }}>
			{/* Header */}
			<View className="flex-row items-center justify-between px-5 py-4">
				<Text className="text-white text-2xl font-bold tracking-tight">
					Albums
				</Text>
				<Pressable className="w-9 h-9 rounded-full bg-neutral-900 items-center justify-center border border-neutral-800">
					<Ionicons name="add" size={20} color="#fbbf24" />
				</Pressable>
			</View>

			{/* Albums Grid */}
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
			>
				<Text className="text-neutral-500 text-xs font-semibold tracking-wider uppercase mb-4">
					My Albums
				</Text>

				<View className="flex-row flex-wrap" style={{ gap: 16 }}>
					{DUMMY_ALBUMS.map((album, idx) => (
						<Pressable
							key={album.id}
							onPress={() =>
								router.push({
									pathname: "/album/[id]",
									params: { id: album.id },
								})
							}
							className="active:opacity-70"
							style={{ width: "47%" }}
						>
							<AlbumCover colors={COVER_COLORS[idx % COVER_COLORS.length]} />
							<View className="mt-2 mb-1">
								<Text
									className="text-white text-sm font-semibold"
									numberOfLines={1}
								>
									{album.name}
								</Text>
								<Text className="text-neutral-500 text-xs mt-0.5">
									{album.count} items
								</Text>
							</View>
						</Pressable>
					))}
				</View>
			</ScrollView>
		</View>
	);
}
