import { useAlert } from "@/components/alert/AlertContext";
import { Button } from "@/components/button/Button";
import { TextInputField } from "@/components/form/TextInputField";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import z from "zod";

const S3FormValues = z.object({
	endpoint: z.url("Please enter a valid URL"),
	region: z.string().min(1, "Region is required"),
	bucket_name: z.string().min(1, "Bucket name is required"),
	access_key_id: z.string().min(1, "Access Key ID is required"),
	secret_access_key: z.string().min(1, "Secret Access Key is required"),
});

type S3FormValues = z.infer<typeof S3FormValues>;

type FieldConfig = {
	key: keyof S3FormValues;
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
	const { alert } = useAlert();
	const [showSecret, _setShowSecret] = useState(false);

	const {
		control,
		handleSubmit,
		formState: { isValid },
	} = useForm<S3FormValues>({
		defaultValues: {
			endpoint: "",
			region: "",
			bucket_name: "",
			access_key_id: "",
			secret_access_key: "",
		},
		resolver: zodResolver(S3FormValues),
		mode: "onChange",
	});

	const handleSave = handleSubmit(() => {
		// TODO: encrypt and save credentials
		alert("Saved", "S3 credentials have been saved successfully.", [
			{ text: "OK", onPress: () => router.back() },
		]);
	});

	const handleTest = () => {
		// TODO: implement actual connectivity test
		alert("Connection Test", "Testing connection to your S3 storage...");
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
						<View key={field.key}>
							<TextInputField
								control={control}
								name={field.key}
								label={field.label}
								icon={<Ionicons name={field.icon} size={16} color="#737373" />}
								placeholder={field.placeholder}
								placeholderTextColor="#404040"
								autoCapitalize="none"
								autoCorrect={false}
								secureTextEntry={field.secure && !showSecret}
								keyboardType={field.keyboardType ?? "default"}
							/>
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
					<Button onPress={handleSave} disabled={!isValid} size="lg">
						<Text className="font-bold">Save Credentials</Text>
					</Button>

					<Button
						variant="outline"
						onPress={() =>
							alert(
								"Clear Credentials",
								"Are you sure you want to remove all saved S3 credentials?",
								[
									{ text: "Cancel", style: "cancel" },
									{
										text: "Clear",
										style: "destructive",
										onPress: () => {},
									},
								],
							)
						}
						className="border border-red-900/60 "
					>
						<Text className="text-red-400 font-semibold text-sm">
							Clear Credentials
						</Text>
					</Button>
				</View>
			</ScrollView>
		</View>
	);
}
