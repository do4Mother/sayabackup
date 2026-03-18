import { useSessions } from "@/hooks/use-sessions";
import { client, trpc } from "@/trpc/trpc";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function InviteTokenScreen() {
	const { token } = useLocalSearchParams<{ token: string }>();
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const sessionStatus = useSessions((state) => state.status);
	const invitationQuery = trpc.org.getInvitation.useQuery(
		{ token: token ?? "" },
		{ enabled: !!token },
	);
	const acceptMutation = trpc.org.acceptInvitation.useMutation();
	const [acceptError, setAcceptError] = useState<string | null>(null);
	const [accepted, setAccepted] = useState(false);

	// Auto-accept if logged in and invitation is valid
	useEffect(() => {
		if (
			sessionStatus === "authenticated" &&
			invitationQuery.data &&
			!accepted &&
			!acceptMutation.isPending
		) {
			acceptMutation.mutate(
				{ token: token ?? "" },
				{
					onSuccess: () => {
						setAccepted(true);
						setTimeout(() => {
							router.replace("/(tabs)/gallery");
						}, 1500);
					},
					onError: (error) => {
						setAcceptError(error.message);
					},
				},
			);
		}
	}, [sessionStatus, invitationQuery.data]);

	const handleGoogleSignIn = () => {
		// Store pending invite token before redirecting to OAuth
		localStorage.setItem("pending_invite_token", token ?? "");

		const googleClientId =
			"27302795397-e6cpk83cbb6ig7vik2nkgva1h71ge348.apps.googleusercontent.com";
		const origin = window.location.origin;
		const redirectURI = `${origin}/auth/google`;
		const nonce = Math.random().toString(36).substring(2);
		localStorage.setItem("oauth_nonce", nonce);

		// Need to fetch secret first
		client.auth.secret.query().then((secret) => {
			const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${googleClientId}&scope=openid%20email&redirect_uri=${encodeURIComponent(redirectURI)}&nonce=${nonce}&state=${secret}`;
			window.location.href = googleAuthUrl;
		});
	};

	// Loading state
	if (invitationQuery.isLoading) {
		return (
			<View
				className="flex-1 bg-neutral-950 items-center justify-center"
				style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
			>
				<ActivityIndicator size="large" />
				<Text className="text-neutral-400 text-sm mt-4">
					Loading invitation...
				</Text>
			</View>
		);
	}

	// Error state (expired, invalid, already accepted)
	if (invitationQuery.error) {
		return (
			<View
				className="flex-1 bg-neutral-950 items-center justify-center px-8"
				style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
			>
				<View className="w-16 h-16 rounded-2xl bg-red-950 border border-red-900 items-center justify-center mb-6">
					<Ionicons name="close-circle" size={32} color="#ef4444" />
				</View>
				<Text className="text-white text-lg font-bold mb-2 text-center">
					Invalid Invitation
				</Text>
				<Text className="text-neutral-400 text-sm text-center mb-8">
					{invitationQuery.error.message}
				</Text>
				<Pressable
					onPress={() => router.replace("/")}
					className="bg-neutral-900 border border-neutral-800 rounded-xl px-6 py-3 active:opacity-80"
				>
					<Text className="text-white font-semibold text-sm">
						Go Home
					</Text>
				</Pressable>
			</View>
		);
	}

	const invitation = invitationQuery.data;

	// Accept error state
	if (acceptError) {
		return (
			<View
				className="flex-1 bg-neutral-950 items-center justify-center px-8"
				style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
			>
				<View className="w-16 h-16 rounded-2xl bg-red-950 border border-red-900 items-center justify-center mb-6">
					<Ionicons name="alert-circle" size={32} color="#ef4444" />
				</View>
				<Text className="text-white text-lg font-bold mb-2 text-center">
					Could Not Accept Invitation
				</Text>
				<Text className="text-neutral-400 text-sm text-center mb-8">
					{acceptError}
				</Text>
				<Pressable
					onPress={() => router.replace("/")}
					className="bg-neutral-900 border border-neutral-800 rounded-xl px-6 py-3 active:opacity-80"
				>
					<Text className="text-white font-semibold text-sm">
						Go Home
					</Text>
				</Pressable>
			</View>
		);
	}

	// Success state
	if (accepted) {
		return (
			<View
				className="flex-1 bg-neutral-950 items-center justify-center px-8"
				style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
			>
				<View className="w-16 h-16 rounded-2xl bg-green-950 border border-green-900 items-center justify-center mb-6">
					<Ionicons
						name="checkmark-circle"
						size={32}
						color="#22c55e"
					/>
				</View>
				<Text className="text-white text-lg font-bold mb-2">
					Welcome!
				</Text>
				<Text className="text-neutral-400 text-sm text-center">
					You&apos;ve joined {invitation?.orgName}. Redirecting...
				</Text>
			</View>
		);
	}

	// Invitation display
	return (
		<View
			className="flex-1 bg-neutral-950 items-center justify-center px-8"
			style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
		>
			{/* Top accent line */}
			<View className="absolute top-0 left-0 right-0 h-0.75 bg-amber-400" />

			<View className="w-20 h-20 rounded-2xl bg-amber-400 items-center justify-center mb-6">
				<Ionicons name="people" size={40} color="#0a0a0a" />
			</View>
			<Text className="text-white text-xl font-bold mb-2 text-center">
				You&apos;ve been invited
			</Text>
			<Text className="text-neutral-400 text-sm text-center mb-1">
				to join
			</Text>
			<Text className="text-amber-400 text-lg font-bold mb-2 text-center">
				{invitation?.orgName}
			</Text>
			<Text className="text-neutral-500 text-xs text-center mb-10">
				Invited by {invitation?.invitedByEmail}
			</Text>

			{sessionStatus === "authenticated" && acceptMutation.isPending && (
				<View className="items-center">
					<ActivityIndicator size="large" />
					<Text className="text-neutral-400 text-sm mt-4">
						Joining organization...
					</Text>
				</View>
			)}

			{sessionStatus !== "authenticated" && (
				<Pressable
					onPress={handleGoogleSignIn}
					className="flex-row items-center justify-center bg-neutral-900 border border-neutral-800 rounded-xl py-4 px-8 active:opacity-80 w-full"
				>
					<Ionicons name="logo-google" size={20} color="#fff" />
					<Text className="text-white font-semibold text-base ml-3">
						Continue with Google
					</Text>
				</Pressable>
			)}
		</View>
	);
}
