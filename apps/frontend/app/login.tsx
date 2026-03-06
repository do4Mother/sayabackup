import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LoginScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const handleLogin = () => {
		router.replace("/(tabs)/gallery");
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

				{/* Form Section */}
				<View className="gap-4 mb-8">
					<View>
						<Text className="text-neutral-500 text-xs tracking-wider uppercase mb-2 ml-1">
							Email
						</Text>
						<View className="flex-row items-center bg-neutral-900 rounded-xl border border-neutral-800 px-4">
							<Ionicons name="mail-outline" size={18} color="#737373" />
							<TextInput
								value={email}
								onChangeText={setEmail}
								placeholder="your@email.com"
								placeholderTextColor="#525252"
								keyboardType="email-address"
								autoCapitalize="none"
								className="flex-1 text-white py-4 ml-3 text-base"
							/>
						</View>
					</View>

					<View>
						<Text className="text-neutral-500 text-xs tracking-wider uppercase mb-2 ml-1">
							Password
						</Text>
						<View className="flex-row items-center bg-neutral-900 rounded-xl border border-neutral-800 px-4">
							<Ionicons name="lock-closed-outline" size={18} color="#737373" />
							<TextInput
								value={password}
								onChangeText={setPassword}
								placeholder="••••••••"
								placeholderTextColor="#525252"
								secureTextEntry={!showPassword}
								className="flex-1 text-white py-4 ml-3 text-base"
							/>
							<Pressable onPress={() => setShowPassword(!showPassword)}>
								<Ionicons
									name={showPassword ? "eye-off-outline" : "eye-outline"}
									size={20}
									color="#737373"
								/>
							</Pressable>
						</View>
					</View>
				</View>

				{/* Login Button */}
				<Pressable
					onPress={handleLogin}
					className="bg-amber-400 rounded-xl py-4 items-center active:opacity-80"
				>
					<Text className="text-neutral-950 font-bold text-base tracking-wide">
						Sign In
					</Text>
				</Pressable>

				{/* Divider */}
				<View className="flex-row items-center my-8">
					<View className="flex-1 h-px bg-neutral-800" />
					<Text className="text-neutral-600 mx-4 text-xs tracking-wider">
						OR
					</Text>
					<View className="flex-1 h-px bg-neutral-800" />
				</View>

				{/* Google Sign In */}
				<Pressable
					onPress={handleLogin}
					className="flex-row items-center justify-center bg-neutral-900 border border-neutral-800 rounded-xl py-4 active:opacity-80"
				>
					<Ionicons name="logo-google" size={20} color="#fff" />
					<Text className="text-white font-semibold text-base ml-3">
						Continue with Google
					</Text>
				</Pressable>

				{/* Footer */}
				<View className="items-center mt-10">
					<Text className="text-neutral-600 text-xs">
						Don't have an account?{" "}
						<Text className="text-amber-400 font-semibold">Sign up</Text>
					</Text>
				</View>
			</View>
		</View>
	);
}
