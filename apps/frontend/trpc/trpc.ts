import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { z } from "zod";
import type { AppRouter } from "../../backend/src/routers/routers";

export const trpc = createTRPCReact<AppRouter>();
export const TRPCProvider = trpc.Provider;

export const asyncStoragePersister = createAsyncStoragePersister({
	storage: AsyncStorage,
});

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnMount: false,
			refetchOnWindowFocus: false,
			gcTime: 1000 * 60 * 60 * 24 * 30, // 30 days
			retry(failureCount, error) {
				if (error instanceof TRPCClientError) {
					const errorData = z
						.object({ code: z.string(), httpStatus: z.number() })
						.safeParse(error.data);

					if (errorData.success) {
						// Do not retry for 4xx errors
						if (
							errorData.data.httpStatus >= 400 &&
							errorData.data.httpStatus < 500
						) {
							return false;
						}
					}
				}

				return failureCount < 3;
			},
		},
	},
});

const baseURL =
	process.env.NODE_ENV === "production"
		? "/trpc"
		: "http://localhost:8787/trpc";

export const client = trpc.createClient({
	links: [
		httpBatchLink({
			url: baseURL,
			fetch: (url, options) =>
				fetch(url, {
					...options,
					credentials: "include",
				}),
		}),
	],
});
