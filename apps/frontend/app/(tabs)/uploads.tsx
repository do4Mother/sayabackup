import { useAlert } from "@/components/alert/AlertContext";
import { Header } from "@/components/app/Header";
import { UploadItem, useUpload } from "@/hooks/use-upload";
import { formatFileSize } from "@/lib/file_size";
import { trpc } from "@/trpc/trpc";
import { Ionicons } from "@expo/vector-icons";
import {
	launchImageLibraryAsync,
	requestMediaLibraryPermissionsAsync,
} from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

const statusConfig = {
	processing: {
		icon: "hourglass" as const,
		color: "#f59e0b",
		bg: "#451a03",
		label: "Processing",
	},
	uploading: {
		icon: "cloud-upload" as const,
		color: "#3b82f6",
		bg: "#172554",
		label: "Uploading",
	},
	completed: {
		icon: "checkmark-circle" as const,
		color: "#10b981",
		bg: "#052e16",
		label: "Done",
	},
	failed: {
		icon: "alert-circle" as const,
		color: "#ef4444",
		bg: "#450a0a",
		label: "Failed",
	},
	queued: {
		icon: "time" as const,
		color: "#737373",
		bg: "#171717",
		label: "Queued",
	},
};

function ProgressBar({
	progress,
	status,
}: {
	progress: number;
	status: NonNullable<UploadItem["status"]>;
}) {
	const color = statusConfig[status].color;
	return (
		<View className="h-1 bg-neutral-800 rounded-full overflow-hidden mt-2">
			<View
				className="h-full rounded-full"
				style={{
					width: `${progress}%`,
					backgroundColor: color,
				}}
			/>
		</View>
	);
}

function UploadItemRow({
	item,
	onCancel,
}: {
	item: UploadItem;
	onCancel: (id: string) => void;
}) {
	if (!item.status) return null;
	const config = statusConfig[item.status];
	const isVideo = item.mimeType.startsWith("video");
	const isCancellable = item.status === "uploading" || item.status === "queued";

	return (
		<View className="flex-row items-center py-3 px-5">
			{/* Thumbnail placeholder */}
			<View
				className="w-12 h-12 rounded-lg items-center justify-center mr-3"
				style={{ backgroundColor: config.bg }}
			>
				<Ionicons
					name={isVideo ? "videocam" : "image"}
					size={20}
					color={config.color}
				/>
			</View>

			{/* Info */}
			<View className="flex-1">
				<Text
					className="text-neutral-200 text-sm font-medium"
					numberOfLines={1}
				>
					{item.name}
				</Text>
				<View className="flex-row items-center mt-0.5">
					<Text className="text-neutral-600 text-xs">
						{formatFileSize(item.size)}
					</Text>
					<View className="w-1 h-1 rounded-full bg-neutral-700 mx-2" />
					<Text className="text-xs" style={{ color: config.color }}>
						{config.label}
						{item.status === "uploading"
							? ` ${Math.round((item.processedBytes / item.size) * 100)}%`
							: ""}
					</Text>
				</View>
				{isCancellable && (
					<ProgressBar
						progress={Math.round((item.processedBytes / item.size) * 100)}
						status={item.status}
					/>
				)}
			</View>

			{/* Cancel / Status Icon */}
			{isCancellable ? (
				<Pressable
					onPress={() => onCancel(item.id)}
					className="ml-3 w-8 h-8 rounded-full bg-red-500/15 items-center justify-center"
				>
					<Ionicons name="close" size={18} color="#ef4444" />
				</Pressable>
			) : (
				<View className="ml-3">
					<Ionicons name={config.icon} size={20} color={config.color} />
				</View>
			)}
		</View>
	);
}

export default function UploadsScreen() {
	const { alert } = useAlert();
	const { albumId } = useLocalSearchParams<{ albumId?: string }>();
	const router = useRouter();

	const albumQuery = trpc.album.find.useQuery(
		{ id: (albumId as string) ?? "" },
		{ enabled: !!albumId },
	);
	const { data: uploads, cancelUpload, clearAll, upload } = useUpload();

	const uploading = uploads.filter((u) => u.status === "uploading");
	const queued = uploads.filter((u) => u.status === "queued");
	const completed = uploads.filter((u) => u.status === "completed");
	const failed = uploads.filter((u) => u.status === "failed");

	const processing = uploads.filter((u) => u.status === "processing");
	const hasActive = processing.length > 0 || uploading.length > 0 || queued.length > 0;
	const hasData = uploads.length > 0;

	const processedBytes = uploads.reduce((acc, u) => acc + u.processedBytes, 0);
	const totalBytes = uploads.reduce((acc, u) => acc + u.size, 0);
	const totalProgress = totalBytes
		? Math.round((processedBytes / totalBytes) * 100)
		: 0;

	const onPickImage = async () => {
		const permissionResult = await requestMediaLibraryPermissionsAsync();

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
				albumId,
			});
		}
	};

	return (
		<View className="flex-1 bg-neutral-950">
			{/* Header */}
			<Header
				title="Uploads"
				trailing={
					<View className="flex-row items-center gap-2">
						{albumId && (
							<View className="flex-row items-center bg-neutral-800/40 px-3 py-1 rounded-full">
								<Text className="text-neutral-200 text-xs font-medium mr-2">
									{albumQuery.data?.name ??
										(albumQuery.isFetching ? "Loading..." : "Album")}
								</Text>
								<Pressable
									onPress={() => router.replace("/(tabs)/uploads")}
									className="w-6 h-6 rounded-full items-center justify-center"
								>
									<Ionicons name="close" size={16} color="#a3a3a3" />
								</Pressable>
							</View>
						)}
						<View className="flex-row gap-2">
							{hasActive && (
								<Pressable
									onPress={() => cancelUpload()}
									className="flex-row items-center bg-red-500/15 rounded-lg px-3 py-1.5"
								>
									<Ionicons name="close-circle" size={16} color="#ef4444" />
									<Text className="text-red-400 text-xs font-semibold ml-1.5">
										Cancel All
									</Text>
								</Pressable>
							)}
							{hasData && (
								<Pressable
									onPress={clearAll}
									className="flex-row items-center bg-neutral-800 rounded-lg px-3 py-1.5"
								>
									<Ionicons name="trash" size={16} color="#a3a3a3" />
									<Text className="text-neutral-400 text-xs font-semibold ml-1.5">
										Clear
									</Text>
								</Pressable>
							)}
						</View>
					</View>
				}
			/>

			{/* Summary Card */}
			<View className="mx-5 mb-6 bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
				<View className="flex-row items-center justify-between mb-4">
					<View>
						<Text className="text-white text-lg font-bold">
							{totalProgress}% Complete
						</Text>
						<Text className="text-neutral-500 text-xs mt-0.5">
							{uploading.length} uploading • {queued.length} queued
						</Text>
					</View>
					<Pressable
						onPress={onPickImage}
						className="w-12 h-12 rounded-full bg-amber-400/10 items-center justify-center"
					>
						<Ionicons name="cloud-upload" size={24} color="#fbbf24" />
					</Pressable>
				</View>

				{/* Overall progress bar */}
				<View className="h-2 bg-neutral-800 rounded-full overflow-hidden">
					<View
						className="h-full bg-amber-400 rounded-full"
						style={{ width: `${totalProgress}%` }}
					/>
				</View>

				<View className="flex-row mt-4 gap-4">
					<View className="flex-1 bg-neutral-800/50 rounded-xl p-3 items-center">
						<Text className="text-emerald-400 text-lg font-bold">
							{completed.length}
						</Text>
						<Text className="text-neutral-500 text-xs mt-0.5">Done</Text>
					</View>
					<View className="flex-1 bg-neutral-800/50 rounded-xl p-3 items-center">
						<Text className="text-blue-400 text-lg font-bold">
							{uploading.length}
						</Text>
						<Text className="text-neutral-500 text-xs mt-0.5">Active</Text>
					</View>
					<View className="flex-1 bg-neutral-800/50 rounded-xl p-3 items-center">
						<Text className="text-red-400 text-lg font-bold">
							{failed.length}
						</Text>
						<Text className="text-neutral-500 text-xs mt-0.5">Failed</Text>
					</View>
				</View>
			</View>

			{/* Upload List */}
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 40 }}
			>
				{uploading.length > 0 && (
					<View className="mb-4">
						<Text className="text-neutral-500 text-xs font-semibold tracking-wider uppercase px-5 mb-2">
							Uploading
						</Text>
						{uploading.map((item) => (
							<UploadItemRow
								key={item.id}
								item={item}
								onCancel={cancelUpload}
							/>
						))}
					</View>
				)}

				{queued.length > 0 && (
					<View className="mb-4">
						<Text className="text-neutral-500 text-xs font-semibold tracking-wider uppercase px-5 mb-2">
							Queued
						</Text>
						{queued.map((item) => (
							<UploadItemRow
								key={item.id}
								item={item}
								onCancel={cancelUpload}
							/>
						))}
					</View>
				)}

				{failed.length > 0 && (
					<View className="mb-4">
						<Text className="text-neutral-500 text-xs font-semibold tracking-wider uppercase px-5 mb-2">
							Failed
						</Text>
						{failed.map((item) => (
							<UploadItemRow
								key={item.id}
								item={item}
								onCancel={cancelUpload}
							/>
						))}
					</View>
				)}

				{completed.length > 0 && (
					<View className="mb-4">
						<Text className="text-neutral-500 text-xs font-semibold tracking-wider uppercase px-5 mb-2">
							Completed
						</Text>
						{completed.map((item) => (
							<UploadItemRow
								key={item.id}
								item={item}
								onCancel={cancelUpload}
							/>
						))}
					</View>
				)}
			</ScrollView>
		</View>
	);
}
