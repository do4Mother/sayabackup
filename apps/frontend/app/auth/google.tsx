import { trpc } from "@/trpc/trpc";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import z from "zod";

const searchParamsObj = z.object({
	code: z.string(),
	state: z.string(),
});

export default function GoogleAuthScreen() {
	const router = useRouter();
	const glob = useGlobalSearchParams();
	const mutation = trpc.auth.google.useMutation();
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const parseResult = searchParamsObj.safeParse(glob);
		if (!parseResult.success) {
			setError("Invalid authentication parameters.");
			return;
		}
		const { code, state } = parseResult.data;

		mutation.mutate(
			{ code, state },
			{
				onSuccess() {
					router.replace("/(tabs)/gallery");
				},
			},
		);
	}, []);

	if (error) {
		return (
			<View className="flex-1 items-center justify-center space-y-4">
				<Text className="text-red-500 text-sm">{error}</Text>
				<Pressable
					className="flex-row items-center justify-center bg-neutral-900 border border-neutral-800 rounded-xl py-4 active:opacity-80"
					onPress={() => {
						router.replace("/login");
					}}
				>
					<Text className="text-white font-semibold text-base">
						Go to Login
					</Text>
				</Pressable>
			</View>
		);
	}

	return (
		<View className="flex-1 items-center justify-center space-y-4">
			<ActivityIndicator size={"large"} />
			<Text className="text-white text-sm">
				Processing Google authentication...
			</Text>
		</View>
	);
}
