import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useResolveClassNames } from "uniwind";

export default function TabsLayout() {
	const sceneStyle = useResolveClassNames("bg-neutral-950");

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor: "#0a0a0a",
					borderTopColor: "#262626",
					borderTopWidth: 0.5,
					height: 70,
				},
				tabBarActiveTintColor: "#fbbf24",
				tabBarInactiveTintColor: "#737373",
				tabBarLabelStyle: {
					fontSize: 10,
					letterSpacing: 1,
					fontWeight: "600",
					textTransform: "uppercase",
					marginTop: 4,
				},
				sceneStyle: sceneStyle,
			}}
		>
			<Tabs.Screen
				name="gallery"
				options={{
					title: "Gallery",
					tabBarIcon: ({ color }) => (
						<Ionicons name="images-outline" size={22} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="albums"
				options={{
					title: "Albums",
					tabBarIcon: ({ color }) => (
						<Ionicons name="albums-outline" size={22} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="uploads"
				options={{
					title: "Uploads",
					tabBarIcon: ({ color }) => (
						<Ionicons name="cloud-upload-outline" size={22} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: "Settings",
					tabBarIcon: ({ color }) => (
						<Ionicons name="settings-outline" size={22} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
