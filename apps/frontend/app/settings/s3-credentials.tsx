import { useAlert } from "@/components/alert/AlertContext";
import { Header } from "@/components/app/Header";
import { AppButton } from "@/components/button/AppButton";
import { TextInputField } from "@/components/form/TextInputField";
import { S3_CREDENTIALS_STORAGE_KEY } from "@/lib/constant";
import { testS3Connection } from "@/s3/test_connection";
import { trpc } from "@/trpc/trpc";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { decrypt, encrypt } from "@sayabackup/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { twMerge } from "tailwind-merge";
import z from "zod";

const S3FormValues = z.object({
	endpoint: z.string().min(1, "Endpoint is required"),
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
		placeholder: "s3.amazonaws.com",
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
	const insets = useSafeAreaInsets();
	const { alert } = useAlert();
	const [isTestingSuccessful, setIsTestingSuccessful] = useState<
		boolean | null
	>(null);
	const { data: user } = trpc.auth.me.useQuery();
	const data = useQuery({
		enabled: !!user,
		queryKey: ["s3.getCredentials"],
		queryFn: async () => {
			const encrypted = localStorage.getItem(S3_CREDENTIALS_STORAGE_KEY);
			if (!encrypted) {
				return null;
			}
			const value = decrypt(encrypted, user?.user.key ?? "");
			return S3FormValues.parse(JSON.parse(value));
		},
	});

	const testMutation = useMutation({
		mutationFn: async (values: S3FormValues) => testS3Connection(values),
		onSuccess: () => {
			setIsTestingSuccessful(true);
			alert(
				"Connection Successful",
				"Successfully connected to your S3 storage.",
			);
		},
		onError: (error) => {
			setIsTestingSuccessful(false);
			alert(
				"Connection Failed",
				`Failed to connect to your S3 storage.
				\nPlease check your credentials and try again.
			\nError: ${error instanceof Error ? error.message : String(error)}`,
			);
		},
	});

	const saveMutation = useMutation({
		mutationFn: async (values: S3FormValues) => {
			localStorage.setItem(
				S3_CREDENTIALS_STORAGE_KEY,
				encrypt(JSON.stringify(values), user?.user.key ?? ""),
			);
		},
	});

	const {
		control,
		handleSubmit,
		formState: { isValid },
		getValues,
		reset,
	} = useForm<S3FormValues>({
		defaultValues: {
			endpoint: "",
			region: "",
			bucket_name: "",
			access_key_id: "",
			secret_access_key: "",
		},
		values: data.data ?? undefined,
		resolver: zodResolver(S3FormValues),
		mode: "onChange",
	});

	const handleSave = handleSubmit(() => {
		saveMutation.mutate(getValues(), {
			onSuccess() {
				alert("Saved", "S3 credentials have been saved successfully.", [
					{ text: "OK" },
				]);
			},
			onError(error) {
				alert(
					"Save Failed",
					`An error occurred while saving S3 credentials. Please try again.\nError: ${
						error instanceof Error ? error.message : String(error)
					}`,
				);
			},
		});
	});

	const handleTest = () => {
		const values = getValues();
		const hasEmptyFields = Object.values(values).some(
			(value) => value.trim() === "",
		);
		if (hasEmptyFields) {
			alert("Validation Error", "Please fill in all fields before testing.");
			return;
		}

		testMutation.mutate(getValues());
	};

	const onImportConfig = () => {
		DocumentPicker.getDocumentAsync({
			type: ".backup",
		}).then((result) => {
			if (!result.canceled) {
				for (const file of result.assets) {
					if (file.file) {
						const reader = new FileReader();
						reader.onload = (e) => {
							try {
								const text = e.target?.result;
								if (typeof text === "string") {
									localStorage.setItem(S3_CREDENTIALS_STORAGE_KEY, text);
									alert(
										"Import Successful",
										"S3 credentials have been imported successfully.",
										[{ text: "OK" }],
									);
									data.refetch();
									return;
								}

								alert(
									"Import Failed",
									"Unable to read the selected file. Please try again.",
								);
							} catch (error) {
								alert(
									"Import Failed",
									`An error occurred while importing the file. Please ensure it's a valid JSON file with the correct structure.\nError: ${
										error instanceof Error ? error.message : String(error)
									}`,
								);
							}
						};
					}
				}
			}
		});
	};

	return (
		<View className="flex-1 bg-neutral-950" style={{ paddingTop: insets.top }}>
			{/* Header */}
			<Header
				title="S3 Credentials"
				trailing={
					<Pressable onPress={onImportConfig}>
						<Ionicons name="cloud-upload" size={20} color="#fff" />
					</Pressable>
				}
			/>

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
								secureTextEntry={field.secure}
								keyboardType={field.keyboardType ?? "default"}
							/>
						</View>
					))}
				</View>

				{/* Connection Status */}
				<View
					className={twMerge(
						"mx-5 mt-2 bg-neutral-900/60 border border-neutral-800/60 rounded-2xl p-4 flex-row items-center",
						isTestingSuccessful === null
							? ""
							: isTestingSuccessful
								? "border-emerald-500/60"
								: "border-red-500/60",
					)}
				>
					<View className="w-9 h-9 rounded-xl bg-neutral-800 items-center justify-center mr-3">
						{isTestingSuccessful === null ? (
							<Ionicons name="ellipse" size={12} color="#737373" />
						) : isTestingSuccessful ? (
							<Ionicons name="checkmark" size={16} color="#10b981" />
						) : (
							<Ionicons name="close" size={16} color="#ef4444" />
						)}
					</View>
					<View className="flex-1">
						<Text className="text-neutral-300 text-sm font-medium">
							Connection Status
						</Text>
						<Text className="text-neutral-500 text-xs mt-0.5">
							{isTestingSuccessful === null
								? "Not tested yet"
								: isTestingSuccessful
									? "Connection successful"
									: "Connection failed"}
						</Text>
					</View>
					{testMutation.isPending ? (
						<ActivityIndicator color="#737373" />
					) : (
						<Pressable
							onPress={handleTest}
							className="bg-neutral-800 px-4 py-2 rounded-lg active:bg-neutral-700"
						>
							<Text className="text-neutral-300 text-xs font-semibold">
								Test
							</Text>
						</Pressable>
					)}
				</View>

				{/* Action Buttons */}
				<View className="mx-5 mt-8 gap-3">
					<AppButton onPress={handleSave} disabled={!isValid} size="lg">
						<Text className="font-bold">Save Credentials</Text>
					</AppButton>

					<AppButton
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
										onPress: reset,
									},
								],
							)
						}
						className="border border-red-900/60 "
					>
						<Text className="text-red-400 font-semibold text-sm">
							Clear Credentials
						</Text>
					</AppButton>
				</View>
			</ScrollView>
		</View>
	);
}
