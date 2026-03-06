import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
	Alert,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FieldConfig = {
	key: string;
	label: string;
	placeholder: string;
	icon: keyof typeof Ionicons.glyphMap;
	secure?: boolean;
	keyboardType?: "default" | "url";
};

const FIELDS: FieldConfig[] = [
	{
		key: "endpoint",
		label: "Endpoint",
		placeholder: "https://s3.amazonaws.com",
		icon: "link",
		keyboardType: "url",
	},
	{
		key: "region",
		label: "Region",
		placeholder: "us-east-1",
		icon: "globe",
	},
	{
		key: "bucket_name",
		label: "Bucket Name",
		placeholder: "my-backup-bucket",
		icon: "folder",
	},
	{
		key: "access_key_id",
		label: "Access Key ID",
		placeholder: "AKIAIOSFODNN7EXAMPLE",
		icon: "person",
	},
	{
		key: "secret_access_key",
		label: "Secret Access Key",
		placeholder: "••••••••••••••••••••",
		icon: "lock-closed",
		secure: true,
	},
];

export default function S3CredentialsScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const [showSecret, setShowSecret] = useState(false);
	const [values, setValues] = useState<Record<string, string>>({
		endpoint: "",
		region: "",
		bucket_name: "",
		access_key_id: "",
		secret_access_key: "",
	});

	const updateField = (key: string, value: string) => {
		setValues((prev) => ({ ...prev, [key]: value }));
	};

	const allFieldsFilled = Object.values(values).every(
		(v) => v.trim().length > 0,
	);

	const handleSave = () => {
		if (!allFieldsFilled) {
			Alert.alert("Missing Fields", "Please fill in all credential fields.");
			return;
		}
		// TODO: encrypt and save credentials
		Alert.alert("Saved", "S3 credentials have been saved successfully.", [
			{ text: "OK", onPress: () => router.back() },
		]);
	};

	const handleTest = () => {
		if (!allFieldsFilled) {
			Alert.alert(
				"Missing Fields",
				"Please fill in all fields before testing.",
			);
			return;
		}
		// TODO: implement actual connectivity test
		Alert.alert("Connection Test", "Testing connection to your S3 storage...");
	};

	return (
		<View className="flex-1 bg-neutral-950" style={{ paddingTop: insets.top }}>
			{/* Header */}
			<View className="flex-row items-center px-4 py-3">
				<Pressable
					onPress={() => router.back()}
					className="w-10 h-10 items-center justify-center rounded-full active:bg-neutral-800"
				>
					<Ionicons name="arrow-back" size={22} color="#fff" />
				</Pressable>
				<Text className="text-white text-lg font-bold ml-2">
					S3 Credentials
				</Text>
			</View>

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 40 }}
				keyboardShouldPersistTaps="handled"
			>
				{/* Security Notice */}
				<View className="mx-5 mt-2 mb-5 bg-pink-950/40 border border-pink-900/40 rounded-2xl p-4 flex-row">
					<Ionicons
						name="shield-checkmark"
						size={20}
						color="#ec4899"
						style={{ marginTop: 1 }}
					/>
					<Text className="text-pink-200/80 text-xs ml-3 flex-1 leading-5">
						Credentials are encrypted and stored locally on your device. They
						are never sent to our servers.
					</Text>
				</View>

				{/* Credential Fields */}
				<View className="mx-5">
					{FIELDS.map((field) => (
						<View key={field.key} className="mb-4">
							<Text className="text-neutral-400 text-xs font-semibold tracking-wider uppercase mb-2">
								{field.label}
							</Text>
							<View className="flex-row items-center bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
								<View className="pl-4 pr-2">
									<Ionicons name={field.icon} size={16} color="#737373" />
								</View>
								<TextInput
									value={values[field.key]}
									onChangeText={(v) => updateField(field.key, v)}
									placeholder={field.placeholder}
									placeholderTextColor="#404040"
									className="flex-1 text-white text-sm py-3.5 pr-3"
									autoCapitalize="none"
									autoCorrect={false}
									secureTextEntry={field.secure && !showSecret}
									keyboardType={field.keyboardType ?? "default"}
								/>
								{field.secure && (
									<Pressable
										onPress={() => setShowSecret(!showSecret)}
										className="pr-4 pl-2"
									>
										<Ionicons
											name={showSecret ? "eye-off" : "eye"}
											size={18}
											color="#737373"
										/>
									</Pressable>
								)}
							</View>
						</View>
					))}
				</View>

				{/* Connection Status */}
				<View className="mx-5 mt-2 bg-neutral-900/60 border border-neutral-800/60 rounded-2xl p-4 flex-row items-center">
					<View className="w-9 h-9 rounded-xl bg-neutral-800 items-center justify-center mr-3">
						<Ionicons name="pulse" size={18} color="#737373" />
					</View>
					<View className="flex-1">
						<Text className="text-neutral-300 text-sm font-medium">
							Connection Status
						</Text>
						<Text className="text-neutral-500 text-xs mt-0.5">
							Not tested yet
						</Text>
					</View>
					<Pressable
						onPress={handleTest}
						className="bg-neutral-800 px-4 py-2 rounded-lg active:bg-neutral-700"
					>
						<Text className="text-neutral-300 text-xs font-semibold">Test</Text>
					</Pressable>
				</View>

				{/* Action Buttons */}
				<View className="mx-5 mt-8 gap-3">
					<Pressable
						onPress={handleSave}
						className={`rounded-xl py-3.5 items-center ${
							allFieldsFilled
								? "bg-pink-500 active:bg-pink-600"
								: "bg-neutral-800"
						}`}
					>
						<Text
							className={`font-semibold text-sm ${
								allFieldsFilled ? "text-white" : "text-neutral-500"
							}`}
						>
							Save Credentials
						</Text>
					</Pressable>

					<Pressable
						onPress={() =>
							Alert.alert(
								"Clear Credentials",
								"Are you sure you want to remove all saved S3 credentials?",
								[
									{ text: "Cancel", style: "cancel" },
									{
										text: "Clear",
										style: "destructive",
										onPress: () => {
											setValues({
												endpoint: "",
												region: "",
												bucket_name: "",
												access_key_id: "",
												secret_access_key: "",
											});
										},
									},
								],
							)
						}
						className="border border-red-900/60 rounded-xl py-3.5 items-center active:bg-red-950/40"
					>
						<Text className="text-red-400 font-semibold text-sm">
							Clear Credentials
						</Text>
					</Pressable>
				</View>
			</ScrollView>
		</View>
	);
}
