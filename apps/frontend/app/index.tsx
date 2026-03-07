import { trpc } from "@/trpc/trpc";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
	const me = trpc.auth.me.useQuery();

	if (me.data) {
		return <Redirect href="/(tabs)/gallery" />;
	}

	if (me.error) {
		return <Redirect href="/login" />;
	}

	return (
		<View className="flex-1 items-center justify-center">
			<ActivityIndicator size={"large"} />
		</View>
	);
}
