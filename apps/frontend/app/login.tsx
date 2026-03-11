import { trpc } from "@/trpc/trpc";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LoginScreen() {
	const insets = useSafeAreaInsets();

	const secret = trpc.auth.secret.useQuery(void 0);

	const handleLogin = () => {
		const googleClientId =
			"27302795397-e6cpk83cbb6ig7vik2nkgva1h71ge348.apps.googleusercontent.com";
		const origin = window.location.origin;
		const redirectURI = `${origin}/auth/google`;
		// generate nonce and store in localStorage for later verification
		const nonce = Math.random().toString(36).substring(2);
		localStorage.setItem("oauth_nonce", nonce);
		const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${googleClientId}&scope=openid%20email&redirect_uri=${encodeURIComponent(redirectURI)}&nonce=${nonce}&state=${secret.data}`;

		window.location.href = googleAuthUrl;
	};

	return (
		<View
			className="flex-1 bg-neutral-950"
			style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
		>
			{/* Top accent line */}
			<View className="h-0.75 bg-amber-400" />

			<View className="flex-1 justify-center px-8">
				{/* Logo Section */}
				<View className="items-center mb-16">
					<View className="w-20 h-20 rounded-2xl bg-amber-400 items-center justify-center mb-6">
						<Ionicons name="cloud-upload" size={40} color="#0a0a0a" />
					</View>
					<Text className="text-white text-3xl font-bold tracking-widest mb-2">
						SAYA
					</Text>
					<Text className="text-neutral-500 text-sm tracking-wider uppercase">
						Backup your memories
					</Text>
				</View>

				{/* Google Sign In */}
				{secret.isSuccess && (
					<Pressable
						onPress={handleLogin}
						className="flex-row items-center justify-center bg-neutral-900 border border-neutral-800 rounded-xl py-4 active:opacity-80"
					>
						<Ionicons name="logo-google" size={20} color="#fff" />
						<Text className="text-white font-semibold text-base ml-3">
							Continue with Google
						</Text>
					</Pressable>
				)}
			</View>
		</View>
	);
}
