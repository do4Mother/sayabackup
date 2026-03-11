import CustomImage from "@/components/app/CustomImage";
import { Header } from "@/components/app/Header";
import { trpc } from "@/trpc/trpc";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
	ActivityIndicator,
	Pressable,
	RefreshControl,
	ScrollView,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { match } from "ts-pattern";
import { AppRouterOutput } from "../../../backend/src/routers/routers";

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

function AlbumCover({
	images,
}: {
	images: AppRouterOutput["album"]["getWithImage"][number]["images"];
}) {
	return (
		<View className="w-full aspect-square rounded-xl overflow-hidden flex-row flex-wrap">
			{match(images)
				.with([], () =>
					Array.from({ length: 4 }).map((_, idx) => (
						<View
							key={idx}
							className="items-center justify-center"
							style={{
								width: "50%",
								height: "50%",
								backgroundColor:
									COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)][
										Math.floor(Math.random() * 4)
									],
							}}
						>
							<Ionicons name="image" size={24} color="rgba(255,255,255,0.2)" />
						</View>
					)),
				)
				.otherwise(() =>
					images.map((image) => (
						<View
							key={image.id}
							className="items-center justify-center"
							style={{ width: "50%", height: "50%" }}
						>
							<CustomImage
								source={{ uri: image.url }}
								className="w-full h-full"
								contentFit="cover"
							/>
						</View>
					)),
				)}
		</View>
	);
}

export default function AlbumsScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const albums = trpc.album.getWithImage.useQuery();

	return (
		<View className="flex-1 bg-neutral-950" style={{ paddingTop: insets.top }}>
			{/* Header */}
			<Header
				title="Albums"
				trailing={
					<Pressable
						className="w-9 h-9 rounded-full bg-neutral-900 items-center justify-center border border-neutral-800"
						onPress={() => router.push("/album/create")}
					>
						<Ionicons name="add" size={20} color="#fbbf24" />
					</Pressable>
				}
				showBackButton={false}
			/>

			{/* Albums Grid */}
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
				refreshControl={
					<RefreshControl
						refreshing={albums.isLoading}
						onRefresh={() => albums.refetch()}
						colors={["#fbbf24"]}
					/>
				}
			>
				<Text className="text-neutral-500 text-xs font-semibold tracking-wider uppercase mb-4">
					My Albums
				</Text>

				{match(albums.data)
					.with(undefined, () => (
						<View className="items-center justify-center flex-1">
							<ActivityIndicator size="small" />
						</View>
					))
					.with([], () => (
						<View className="items-center justify-center flex-1">
							<Ionicons name="albums-outline" size={64} color="#6b7280" />
							<Text className="text-neutral-400 mt-4 text-lg">
								No albums yet
							</Text>
							<Text className="text-neutral-500 text-sm mt-1 text-center">
								Create your first album to start saving photos.
							</Text>
							<Pressable
								onPress={() => router.push("/album/create")}
								className="mt-4 bg-blue-600 px-4 py-2 rounded"
							>
								<Text className="text-white font-semibold">Create Album</Text>
							</Pressable>
						</View>
					))
					.otherwise((data) => (
						<View className="flex-row flex-wrap" style={{ gap: 16 }}>
							{data.map((album, idx) => (
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
									<AlbumCover images={album.images} />
									<View className="mt-2 mb-1">
										<Text
											className="text-white text-sm font-semibold"
											numberOfLines={1}
										>
											{album.name}
										</Text>
										<Text className="text-neutral-500 text-xs mt-0.5">
											{album.total} items
										</Text>
									</View>
								</Pressable>
							))}
						</View>
					))}
			</ScrollView>
		</View>
	);
}
