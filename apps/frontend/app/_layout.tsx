import { AlertProvider } from "@/components/alert/AlertContext";
import { useSessions } from "@/hooks/use-sessions";
import { ContextUpload, createUploadStore } from "@/hooks/use-upload";
import {
	asyncStoragePersister,
	client,
	queryClient,
	TRPCProvider,
} from "@/trpc/trpc";
import { Toasts } from "@backpackapp-io/react-native-toast";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useResolveClassNames } from "uniwind";
import "../global.css";

export default function RootLayout() {
	return (
		<SafeAreaProvider>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<TRPCProvider client={client} queryClient={queryClient}>
					<PersistQueryClientProvider
						client={queryClient}
						persistOptions={{ persister: asyncStoragePersister }}
					>
						<UploadProvider>
							<AlertProvider>
								<StatusBar style="light" />
								<Routers />
								<Toasts />
							</AlertProvider>
						</UploadProvider>
					</PersistQueryClientProvider>
				</TRPCProvider>
			</GestureHandlerRootView>
		</SafeAreaProvider>
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

function Routers() {
	const contentStyle = useResolveClassNames("bg-neutral-950");

	const router = useRouter();
	const pathname = usePathname();
	const state = useSessions((state) => state.status);
	const setState = useSessions((state) => state.setState);

	useEffect(() => {
		client.auth.me
			.query()
			.then(async () => {
				setState("authenticated");

				// Ensure personal org is set as default context
				const activeOrgId = useSessions.getState().activeOrgId;
				if (!activeOrgId) {
					const personalOrg = await client.org.getPersonalOrg.query();
					if (personalOrg) {
						useSessions
							.getState()
							.setActiveOrg(personalOrg.id, personalOrg.name);
					}
				}

				if (pathname === "/login") {
					router.replace("/(tabs)/gallery");
				}
			})
			.catch(() => {
				setState("unauthenticated");
			});
	}, []);

	if (state === "loading") {
		return null;
	}

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: contentStyle,
				animation: "fade",
			}}
		>
			<Stack.Screen name="index" />
			<Stack.Screen name="login" />
			<Stack.Screen name="invite/[token]" options={{ animation: "fade" }} />
			<Stack.Protected guard={state === "authenticated"}>
				<Stack.Screen name="(tabs)" />
				<Stack.Screen
					name="album/[id]"
					options={{ animation: "slide_from_right" }}
				/>
				<Stack.Screen
					name="album/create"
					options={{
						presentation: "modal",
					}}
				/>
				<Stack.Screen
					name="album/[id]/rename"
					options={{
						presentation: "modal",
					}}
				/>
				<Stack.Screen name="photo/[id]" options={{ animation: "fade" }} />
				<Stack.Screen
					name="photo/[id]/add-to-album"
					options={{
						presentation: "modal",
					}}
				/>
				<Stack.Screen
					name="settings/s3-credentials"
					options={{ animation: "slide_from_right" }}
				/>
				<Stack.Screen
					name="organization/index"
					options={{ animation: "slide_from_right" }}
				/>
				<Stack.Screen
					name="organization/create"
					options={{
						presentation: "modal",
					}}
				/>
				<Stack.Screen
					name="organization/invite"
					options={{
						presentation: "modal",
					}}
				/>
			</Stack.Protected>
		</Stack>
	);
}
