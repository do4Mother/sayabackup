import CustomImage from "@/components/app/CustomImage";
import { trpc } from "@/trpc/trpc";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppRouterOutput } from "../../../backend/src/routers/routers";

function AlbumCover({
	images,
}: {
	images: AppRouterOutput["album"]["getWithImage"][number]["images"];
}) {
	return (
		<View className="w-full aspect-square rounded-xl overflow-hidden flex-row flex-wrap">
			{images.map((image) => (
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
			))}
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
					{albums.data?.map((album, idx) => (
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
			</ScrollView>
		</View>
	);
}
