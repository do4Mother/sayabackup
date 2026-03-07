import { useAlert } from "@/components/alert/AlertContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
	Dimensions,
	Modal,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

const EDIT_TOOLS = [
	{ id: "crop", icon: "crop" as const, label: "Crop" },
	{ id: "rotate", icon: "refresh" as const, label: "Rotate" },
	{ id: "tune", icon: "sunny" as const, label: "Adjust" },
	{ id: "filter", icon: "color-filter" as const, label: "Filter" },
	{ id: "text", icon: "text" as const, label: "Text" },
	{ id: "draw", icon: "brush" as const, label: "Draw" },
];

const FILTER_PRESETS = [
	{ id: "original", label: "Original", opacity: 1 },
	{ id: "vivid", label: "Vivid", opacity: 0.85 },
	{ id: "warm", label: "Warm", opacity: 0.7 },
	{ id: "cool", label: "Cool", opacity: 0.75 },
	{ id: "mono", label: "Mono", opacity: 0.6 },
	{ id: "fade", label: "Fade", opacity: 0.5 },
];

export default function PhotoDetailScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { alert } = useAlert();
	const { id } = useLocalSearchParams<{ id: string }>();
	const [showInfo, setShowInfo] = useState(false);
	const [isFavorite, setIsFavorite] = useState(false);
	const [showEdit, setShowEdit] = useState(false);
	const [showAlbumPicker, setShowAlbumPicker] = useState(false);
	const [showShareSheet, setShowShareSheet] = useState(false);
	const [showMoreMenu, setShowMoreMenu] = useState(false);
	const [selectedFilter, setSelectedFilter] = useState("original");
	const [brightness, setBrightness] = useState(50);
	const [contrast, setContrast] = useState(50);
	const [addedToAlbums, setAddedToAlbums] = useState<string[]>([]);

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
						alert("Deleted", "Photo has been deleted.", [
							{ text: "OK", onPress: () => router.back() },
						]);
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

	const handleEditTool = (toolId: string) => {
		if (toolId === "rotate") {
			alert("Rotated", "Photo rotated 90° clockwise.");
		} else if (toolId === "crop") {
			alert("Crop", "Crop tool opened. (Demo)");
		} else if (toolId === "text") {
			alert("Text", "Text overlay tool opened. (Demo)");
		} else if (toolId === "draw") {
			alert("Draw", "Drawing tool opened. (Demo)");
		}
	};

	const toggleEdit = () => {
		setShowInfo(false);
		setShowEdit(!showEdit);
	};

	const toggleInfo = () => {
		setShowEdit(false);
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
			<View className="flex-1 justify-center items-center">
				<View
					className="items-center justify-center rounded-lg"
					style={{
						width: SCREEN_WIDTH,
						height: SCREEN_WIDTH * 0.75,
						backgroundColor: photoColor,
						opacity:
							selectedFilter === "original"
								? 1
								: (FILTER_PRESETS.find((f) => f.id === selectedFilter)
										?.opacity ?? 1),
					}}
				>
					<Ionicons name="image" size={64} color="rgba(255,255,255,0.2)" />
					<Text className="text-white/30 text-sm mt-2 font-medium">
						{selectedFilter !== "original"
							? `Filter: ${selectedFilter}`
							: "Photo Preview"}
					</Text>
				</View>
			</View>

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

					<Pressable onPress={toggleEdit} className="items-center gap-1">
						<Ionicons
							name={showEdit ? "create" : "create-outline"}
							size={24}
							color={showEdit ? "#fbbf24" : "#a3a3a3"}
						/>
						<Text
							className={`text-[10px] tracking-wider ${showEdit ? "text-amber-400" : "text-neutral-500"}`}
						>
							EDIT
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

				{/* Edit Panel */}
				{showEdit && (
					<ScrollView className="border-t border-neutral-900 max-h-80">
						<View className="px-5 py-4 gap-5">
							{/* Edit Tools */}
							<View>
								<Text className="text-neutral-500 text-xs font-semibold tracking-wider uppercase mb-3">
									Tools
								</Text>
								<ScrollView
									horizontal
									showsHorizontalScrollIndicator={false}
									contentContainerStyle={{ gap: 12 }}
								>
									{EDIT_TOOLS.map((tool) => (
										<Pressable
											key={tool.id}
											onPress={() => handleEditTool(tool.id)}
											className="items-center gap-2"
										>
											<View className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 items-center justify-center">
												<Ionicons name={tool.icon} size={22} color="#fbbf24" />
											</View>
											<Text className="text-neutral-400 text-[10px] tracking-wider">
												{tool.label}
											</Text>
										</Pressable>
									))}
								</ScrollView>
							</View>

							{/* Filters */}
							<View>
								<Text className="text-neutral-500 text-xs font-semibold tracking-wider uppercase mb-3">
									Filters
								</Text>
								<ScrollView
									horizontal
									showsHorizontalScrollIndicator={false}
									contentContainerStyle={{ gap: 10 }}
								>
									{FILTER_PRESETS.map((filter) => (
										<Pressable
											key={filter.id}
											onPress={() => setSelectedFilter(filter.id)}
											className="items-center gap-1.5"
										>
											<View
												className={`w-16 h-16 rounded-xl items-center justify-center border ${
													selectedFilter === filter.id
														? "border-amber-400"
														: "border-neutral-800"
												}`}
												style={{
													backgroundColor: photoColor,
													opacity: filter.opacity,
												}}
											>
												<Ionicons
													name="image"
													size={18}
													color="rgba(255,255,255,0.3)"
												/>
											</View>
											<Text
												className={`text-[10px] tracking-wider ${
													selectedFilter === filter.id
														? "text-amber-400 font-semibold"
														: "text-neutral-500"
												}`}
											>
												{filter.label}
											</Text>
										</Pressable>
									))}
								</ScrollView>
							</View>

							{/* Adjustments */}
							<View>
								<Text className="text-neutral-500 text-xs font-semibold tracking-wider uppercase mb-3">
									Adjustments
								</Text>
								<View className="gap-4">
									<SliderRow
										label="Brightness"
										icon="sunny-outline"
										value={brightness}
										onDecrease={() => setBrightness((v) => Math.max(0, v - 10))}
										onIncrease={() =>
											setBrightness((v) => Math.min(100, v + 10))
										}
									/>
									<SliderRow
										label="Contrast"
										icon="contrast-outline"
										value={contrast}
										onDecrease={() => setContrast((v) => Math.max(0, v - 10))}
										onIncrease={() => setContrast((v) => Math.min(100, v + 10))}
									/>
								</View>
							</View>

							{/* Save Button */}
							<Pressable
								onPress={() => {
									alert("Saved", "Your edits have been saved.");
									setShowEdit(false);
								}}
								className="bg-amber-400 rounded-xl py-3 items-center active:opacity-80"
							>
								<Text className="text-neutral-950 font-bold text-sm tracking-wide">
									Save Changes
								</Text>
							</Pressable>
						</View>
					</ScrollView>
				)}

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

function SliderRow({
	label,
	icon,
	value,
	onDecrease,
	onIncrease,
}: {
	label: string;
	icon: keyof typeof Ionicons.glyphMap;
	value: number;
	onDecrease: () => void;
	onIncrease: () => void;
}) {
	return (
		<View className="flex-row items-center gap-3">
			<Ionicons name={icon} size={16} color="#fbbf24" />
			<Text className="text-neutral-400 text-xs w-20">{label}</Text>
			<Pressable
				onPress={onDecrease}
				className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 items-center justify-center"
			>
				<Ionicons name="remove" size={16} color="#a3a3a3" />
			</Pressable>
			{/* Visual bar */}
			<View className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
				<View
					className="h-full bg-amber-400 rounded-full"
					style={{ width: `${value}%` }}
				/>
			</View>
			<Text className="text-neutral-500 text-xs w-8 text-center">{value}</Text>
			<Pressable
				onPress={onIncrease}
				className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 items-center justify-center"
			>
				<Ionicons name="add" size={16} color="#a3a3a3" />
			</Pressable>
		</View>
	);
}
