import { AlertProvider } from "@/components/alert/AlertContext";
import { ContextUpload, createUploadStore } from "@/hooks/use-upload";
import { client, queryClient, TRPCProvider } from "@/trpc/trpc";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useResolveClassNames } from "uniwind";
import "../global.css";

export default function RootLayout() {
	const contentStyle = useResolveClassNames("bg-neutral-950");

	return (
		<TRPCProvider client={client} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				<UploadProvider>
					<AlertProvider>
						<StatusBar style="light" />
						<Stack
							screenOptions={{
								headerShown: false,
								contentStyle: contentStyle,
								animation: "fade",
							}}
						>
							<Stack.Screen name="index" />
							<Stack.Screen name="login" />
							<Stack.Screen name="(tabs)" />
							<Stack.Screen
								name="album/[id]"
								options={{ animation: "slide_from_right" }}
							/>
							<Stack.Screen name="photo/[id]" options={{ animation: "fade" }} />
							<Stack.Screen
								name="settings/s3-credentials"
								options={{ animation: "slide_from_right" }}
							/>
						</Stack>
					</AlertProvider>
				</UploadProvider>
			</QueryClientProvider>
		</TRPCProvider>
	);
}

function UploadProvider({ children }: { children: React.ReactNode }) {
	const uploadStore = createUploadStore();
	return (
		<ContextUpload.Provider value={uploadStore}>
			{children}
		</ContextUpload.Provider>
	);
}
