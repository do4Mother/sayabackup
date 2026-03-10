import { AlertProvider } from "@/components/alert/AlertContext";
import { ContextUpload, createUploadStore } from "@/hooks/use-upload";
import {
	asyncStoragePersister,
	client,
	queryClient,
	trpc,
	TRPCProvider,
} from "@/trpc/trpc";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Redirect, Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useResolveClassNames } from "uniwind";
import "../global.css";

export default function RootLayout() {
	const contentStyle = useResolveClassNames("bg-neutral-950");

	return (
		<TRPCProvider client={client} queryClient={queryClient}>
			<PersistQueryClientProvider
				client={queryClient}
				persistOptions={{ persister: asyncStoragePersister }}
			>
				<UploadProvider>
					<AlertProvider>
						<AuthMiddleware>
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
								<Stack.Screen
									name="photo/[id]"
									options={{ animation: "fade" }}
								/>
								<Stack.Screen
									name="settings/s3-credentials"
									options={{ animation: "slide_from_right" }}
								/>
							</Stack>
						</AuthMiddleware>
					</AlertProvider>
				</UploadProvider>
			</PersistQueryClientProvider>
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

function AuthMiddleware({ children }: { children: React.ReactNode }) {
	const user = trpc.auth.me.useQuery();
	const pathname = usePathname();

	if (user.isLoading) {
		return null; // or a loading spinner
	}

	if (!user.data && pathname !== "/login") {
		return <Redirect href="/login" />;
	}

	return <>{children}</>;
}
