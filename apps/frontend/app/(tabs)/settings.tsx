import { Header } from "@/components/app/Header";
import { useSessions } from "@/hooks/use-sessions";
import { trpc } from "@/trpc/trpc";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SettingRowProps = {
	icon: keyof typeof Ionicons.glyphMap;
	iconColor: string;
	iconBg: string;
	title: string;
	subtitle?: string;
	trailing?: React.ReactNode;
	onPress?: () => void;
};

function SettingRow({
	icon,
	iconColor,
	iconBg,
	title,
	subtitle,
	trailing,
	onPress,
}: SettingRowProps) {
	return (
		<Pressable
			onPress={onPress}
			className="flex-row items-center py-3.5 px-5 active:bg-neutral-900"
		>
			<View
				className="w-9 h-9 rounded-xl items-center justify-center mr-3"
				style={{ backgroundColor: iconBg }}
			>
				<Ionicons name={icon} size={18} color={iconColor} />
			</View>
			<View className="flex-1">
				<Text className="text-white text-sm font-medium">{title}</Text>
				{subtitle && (
					<Text className="text-neutral-500 text-xs mt-0.5">{subtitle}</Text>
				)}
			</View>
			{trailing || (
				<Ionicons name="chevron-forward" size={16} color="#525252" />
			)}
		</Pressable>
	);
}

function SectionHeader({ title }: { title: string }) {
	return (
		<Text className="text-neutral-500 text-xs font-semibold tracking-wider uppercase px-5 pt-6 pb-2">
			{title}
		</Text>
	);
}

export default function SettingsScreen() {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const [autoBackup, setAutoBackup] = useState(true);
	const [wifiOnly, setWifiOnly] = useState(true);
	const [notifications, setNotifications] = useState(false);
	const logoutMutation = trpc.auth.logout.useMutation();
	const setSessionState = useSessions((state) => state.setState);

	const onLogout = () => {
		logoutMutation.mutate(void 0, {
			onSuccess() {
				setSessionState("unauthenticated");
				router.replace("/login");
			},
		});
	};

	return (
		<View className="flex-1 bg-neutral-950" style={{ paddingTop: insets.top }}>
			{/* Header */}
			<Header title="Settings" />

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 60 }}
			>
				{/* Profile Card */}
				<View className="mx-5 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 mb-2">
					<View className="flex-row items-center">
						<View className="w-14 h-14 rounded-full bg-amber-400 items-center justify-center mr-4">
							<Text className="text-neutral-950 text-xl font-bold">JD</Text>
						</View>
						<View className="flex-1">
							<Text className="text-white text-base font-bold">John Doe</Text>
							<Text className="text-neutral-500 text-sm mt-0.5">
								john.doe@email.com
							</Text>
						</View>
						<Ionicons name="chevron-forward" size={16} color="#525252" />
					</View>

					{/* Storage usage */}
					<View className="mt-5 pt-4 border-t border-neutral-800">
						<View className="flex-row items-center justify-between mb-2">
							<Text className="text-neutral-400 text-xs font-medium">
								Storage Used
							</Text>
							<Text className="text-neutral-400 text-xs">2.4 GB / 15 GB</Text>
						</View>
						<View className="h-2 bg-neutral-800 rounded-full overflow-hidden">
							<View
								className="h-full bg-amber-400 rounded-full"
								style={{ width: "16%" }}
							/>
						</View>
					</View>
				</View>

				{/* Backup Settings */}
				<SectionHeader title="Backup" />
				<SettingRow
					icon="cloud-upload"
					iconColor="#fbbf24"
					iconBg="#451a03"
					title="Auto Backup"
					subtitle="Automatically backup new photos"
					trailing={
						<Switch
							value={autoBackup}
							onValueChange={setAutoBackup}
							trackColor={{ false: "#404040", true: "#fbbf24" }}
							thumbColor="#fff"
						/>
					}
				/>
				<SettingRow
					icon="wifi"
					iconColor="#3b82f6"
					iconBg="#172554"
					title="Wi-Fi Only"
					subtitle="Only backup when connected to Wi-Fi"
					trailing={
						<Switch
							value={wifiOnly}
							onValueChange={setWifiOnly}
							trackColor={{ false: "#404040", true: "#3b82f6" }}
							thumbColor="#fff"
						/>
					}
				/>
				<SettingRow
					icon="folder"
					iconColor="#22c55e"
					iconBg="#052e16"
					title="Backup Folders"
					subtitle="Camera, Screenshots"
				/>
				<SettingRow
					icon="resize"
					iconColor="#a78bfa"
					iconBg="#2e1065"
					title="Upload Quality"
					subtitle="Original quality"
				/>

				{/* Storage */}
				<SectionHeader title="Storage" />
				<SettingRow
					icon="key"
					iconColor="#ec4899"
					iconBg="#500724"
					title="S3 Credentials"
					subtitle="Configured"
					onPress={() => router.push("/settings/s3-credentials")}
				/>
				<SettingRow
					icon="trash"
					iconColor="#ef4444"
					iconBg="#450a0a"
					title="Free Up Space"
					subtitle="Remove backed up photos from device"
				/>

				{/* General */}
				<SectionHeader title="General" />
				<SettingRow
					icon="notifications"
					iconColor="#06b6d4"
					iconBg="#083344"
					title="Notifications"
					trailing={
						<Switch
							value={notifications}
							onValueChange={setNotifications}
							trackColor={{ false: "#404040", true: "#06b6d4" }}
							thumbColor="#fff"
						/>
					}
				/>
				<SettingRow
					icon="moon"
					iconColor="#e2e8f0"
					iconBg="#1e293b"
					title="Appearance"
					subtitle="Dark"
				/>
				<SettingRow
					icon="information-circle"
					iconColor="#737373"
					iconBg="#262626"
					title="About"
					subtitle="Version 1.0.0"
				/>

				{/* Sign Out */}
				<View className="mt-8 mx-5">
					<Pressable
						onPress={onLogout}
						className="border border-red-900 rounded-xl py-3.5 items-center active:bg-red-950"
					>
						<Text className="text-red-400 font-semibold text-sm">Sign Out</Text>
					</Pressable>
				</View>
			</ScrollView>
		</View>
	);
}
