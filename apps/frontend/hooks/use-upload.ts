import { generateThumbnail } from "@/lib/generate-thumbnail";
import { uploadToS3 } from "@/s3/upload";
import { client, trpc } from "@/trpc/trpc";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { randomString, sanitizeFilename } from "@sayabackup/utils";
import axios, { CanceledError } from "axios";
import axiosRetry from "axios-retry";
import { ImagePickerAsset } from "expo-image-picker";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { createContext, useContext, useEffect } from "react";
import { create, useStore } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

axiosRetry(axios, {
	retries: 3,
});

export type UploadItem = {
	id: string;
	file: File;
	uri: string;
	mimeType: string;
	name: string;
	size: number;
	processedBytes: number;
	abortController?: AbortController;
	status?: "uploading" | "completed" | "failed" | "queued";
	error?: string;
};

type State = {
	data: UploadItem[];
};

type Action = {
	setData: (data: UploadItem[]) => void;
	upload: (data: {
		images: ImagePickerAsset[];
		albumId?: string;
	}) => Promise<void>;
	cancelUpload: (id?: string) => void;
	clearAll: () => void;
};

export const createUploadStore = () =>
	create<State & Action>()(
		persist(
			(set) => {
				const createGalleryMutation = trpc.gallery.create.useMutation();
				const clientUtils = trpc.useUtils();

				return {
					data: [],
					setData: (data: UploadItem[]) => set({ data }),
					cancelUpload: (id?: string) => {
						set((state) => {
							const targets = id
								? state.data.filter((item) => item.id === id)
								: state.data.filter(
										(item) =>
											item.status === "uploading" || item.status === "queued",
									);

							for (const item of targets) {
								item.abortController?.abort();
							}

							return {
								data: state.data.map((item) =>
									targets.some((t) => t.id === item.id)
										? { ...item, status: "failed" as const, error: "Cancelled" }
										: item,
								),
							};
						});
					},
					clearAll: () => {
						set((state) => {
							// Abort any active uploads before clearing
							for (const item of state.data) {
								if (item.status === "uploading" || item.status === "queued") {
									item.abortController?.abort();
								}
							}
							return { data: [] };
						});
					},
					upload: async (data) => {
						const assets = data.images.map(async (asset) => {
							return {
								id: randomString(12),
								file: asset.file!,
								uri: asset.uri,
								mimeType: asset.mimeType || "image/jpeg",
								name: asset.fileName || `media-${Date.now()}`,
								size: asset.fileSize || 0,
								processedBytes: 0,
								abortController: new AbortController(),
								status: "queued",
							} as UploadItem;
						});

						const resolvedAssets = await Promise.all(assets);

						const key = await client.auth.me.query().then((me) => me.user.key);

						set((prev) => ({ data: [...prev.data, ...resolvedAssets] }));

						for await (const media of resolvedAssets) {
							try {
								/**
								 * set status to uploading
								 */
								set((state) => ({
									data: state.data.map((m) =>
										m.id === media.id ? { ...m, status: "uploading" } : m,
									),
								}));

								const albumPath = sanitizeFilename(
									clientUtils.album.find.getData({ id: data.albumId ?? "" })
										?.name ?? "unknown",
								);

								const { thumbnailBlob } = await generateThumbnail({
									uri: media.uri,
									mimeType: media.mimeType,
								});

								const thumbnailPath = `thumbnails/${media.name}`;
								const filePath = `${albumPath}/${media.name}`;
								const uploadThumbnail = await uploadToS3({
									path: thumbnailPath,
									type: media.mimeType,
									key: key,
								});

								// upload thumbnail
								const isSuccess = await axios
									.put(uploadThumbnail, thumbnailBlob, {
										headers: {
											"Content-Type": media.mimeType,
										},
										signal: media.abortController?.signal,
									})
									.then(() => true)
									.catch((error) => {
										if (error instanceof CanceledError) {
											return false;
										}
									});

								if (!isSuccess) {
									// skip uploading original if thumbnail upload is cancelled
									continue;
								}

								const uploadFile = await uploadToS3({
									path: filePath,
									type: media.mimeType,
									key: key,
								});

								// upload original file with progress tracking
								await axios.put(uploadFile, media.file, {
									headers: {
										"Content-Type": media.mimeType,
									},
									signal: media.abortController?.signal,
									onUploadProgress: (progressEvent) => {
										const processedBytes = progressEvent.loaded;
										set((state) => ({
											data: state.data.map((m) =>
												m.id === media.id ? { ...m, processedBytes } : m,
											),
										}));

										if (processedBytes === media.size) {
											// create gallery record when upload is complete
											createGalleryMutation.mutate(
												{
													filePath: filePath,
													thumbnailPath: thumbnailPath,
													mimeType: media.mimeType,
													albumId: data.albumId,
												},
												{
													onSuccess() {
														if (data.albumId) {
															clientUtils.gallery.get.refetch({
																albumId: data.albumId,
															});
														}

														set((state) => ({
															data: state.data.map((m) =>
																m.id === media.id
																	? { ...m, status: "completed" }
																	: m,
															),
														}));

														clientUtils.gallery.get.invalidate();
													},
												},
											);
										}
									},
								});
							} catch (error) {
								set((state) => ({
									data: state.data.map((m) =>
										m.id === media.id
											? {
													...m,
													status: "failed",
													error: (error as Error).message,
												}
											: m,
									),
								}));
							}
						}
					},
				};
			},
			{
				name: "upload-store",
				storage: createJSONStorage(() => AsyncStorage),
			},
		),
	);

export type UploadStore = ReturnType<typeof createUploadStore>;
export const ContextUpload = createContext<UploadStore | null>(null);

// Module-level wake lock state shared across all useUpload instances
let wakeLockActive = false;
let wakeLockPromise: Promise<void> | null = null;

export const useUpload = () => {
	const store = useContext(ContextUpload);
	if (!store) {
		throw new Error("useUpload must be used within a UploadProvider");
	}

	useEffect(() => {
		const unsubscribe = store.subscribe((state) => {
			const isUploading = state.data.some(
				(item) => item.status === "uploading",
			);

			if (isUploading && !wakeLockActive) {
				wakeLockActive = true;
				wakeLockPromise = activateKeepAwakeAsync();
			}

			if (!isUploading && wakeLockActive) {
				wakeLockActive = false;
				const pending = wakeLockPromise;
				wakeLockPromise = null;
				// Wait for activation to complete before deactivating
				if (pending) {
					pending.then(() => deactivateKeepAwake());
				} else {
					deactivateKeepAwake();
				}
			}
		});

		return () => {
			unsubscribe();
		};
	}, [store]);

	return useStore(
		store,
		useShallow((state) => state),
	);
};
