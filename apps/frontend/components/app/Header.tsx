import { Ionicons } from "@expo/vector-icons";
import { useRouter, useSegments } from "expo-router";
import { Pressable, Text, View } from "react-native";

type HeaderProps = {
	title?: string;
	leading?: React.ReactNode;
	showBackButton?: boolean;
	trailing?: React.ReactNode;
};

export function Header(props: HeaderProps) {
	const router = useRouter();
	const segments = useSegments();
	const isInTabs = segments[0] === "(tabs)";

	const { title, leading, trailing } = props;
	const showBackButton = props.showBackButton ?? !isInTabs;

	return (
		<View className="flex-row items-center px-5 h-17 gap-2">
			{showBackButton && router.canGoBack() && (
				<Pressable
					onPress={() => router.back()}
					className="size-8 items-start justify-center"
				>
					<Ionicons name="arrow-back" size={22} color={"white"} />
				</Pressable>
			)}
			{leading}
			{title && (
				<Text className="text-white text-2xl font-bold tracking-tight text-left flex-1">
					{title}
				</Text>
			)}
			{trailing}
		</View>
	);
}
