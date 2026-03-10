import { UploadItem, useUpload } from "@/hooks/use-upload";
import { formatFileSize } from "@/lib/file_size";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const statusConfig = {
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

function UploadItemRow({ item }: { item: UploadItem }) {
	if (!item.status) return null;
	const config = statusConfig[item.status];
	const isVideo = item.name.toLowerCase().endsWith(".mp4");

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
				{(item.status === "uploading" || item.status === "queued") && (
					<ProgressBar
						progress={Math.round((item.processedBytes / item.size) * 100)}
						status={item.status}
					/>
				)}
			</View>

			{/* Status Icon */}
			<View className="ml-3">
				<Ionicons name={config.icon} size={20} color={config.color} />
			</View>
		</View>
	);
}

export default function UploadsScreen() {
	const insets = useSafeAreaInsets();
	const { data: uploads } = useUpload();

	const uploading = uploads.filter((u) => u.status === "uploading");
	const queued = uploads.filter((u) => u.status === "queued");
	const completed = uploads.filter((u) => u.status === "completed");
	const failed = uploads.filter((u) => u.status === "failed");

	const processedBytes = uploads.reduce((acc, u) => acc + u.processedBytes, 0);
	const totalBytes = uploads.reduce((acc, u) => acc + u.size, 0);
	const totalProgress = totalBytes
		? Math.round((processedBytes / totalBytes) * 100)
		: 0;

	return (
		<View className="flex-1 bg-neutral-950" style={{ paddingTop: insets.top }}>
			{/* Header */}
			<View className="px-5 py-4">
				<Text className="text-white text-2xl font-bold tracking-tight">
					Uploads
				</Text>
			</View>

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
					<View className="w-12 h-12 rounded-full bg-amber-400/10 items-center justify-center">
						<Ionicons name="cloud-upload" size={24} color="#fbbf24" />
					</View>
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
							<UploadItemRow key={item.id} item={item} />
						))}
					</View>
				)}

				{queued.length > 0 && (
					<View className="mb-4">
						<Text className="text-neutral-500 text-xs font-semibold tracking-wider uppercase px-5 mb-2">
							Queued
						</Text>
						{queued.map((item) => (
							<UploadItemRow key={item.id} item={item} />
						))}
					</View>
				)}

				{failed.length > 0 && (
					<View className="mb-4">
						<Text className="text-neutral-500 text-xs font-semibold tracking-wider uppercase px-5 mb-2">
							Failed
						</Text>
						{failed.map((item) => (
							<UploadItemRow key={item.id} item={item} />
						))}
					</View>
				)}

				{completed.length > 0 && (
					<View className="mb-4">
						<Text className="text-neutral-500 text-xs font-semibold tracking-wider uppercase px-5 mb-2">
							Completed
						</Text>
						{completed.map((item) => (
							<UploadItemRow key={item.id} item={item} />
						))}
					</View>
				)}
			</ScrollView>
		</View>
	);
}
