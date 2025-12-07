import { uploadToS3 } from "@/s3/upload";
import { client, trpc } from "@/trpc/trpc";
import { randomString, sanitizeFilename } from "@sayabackup/utils";
import axios, { CanceledError } from "axios";
import axiosRetry from "axios-retry";
import { ImageManipulator } from "expo-image-manipulator";
import { ImagePickerAsset } from "expo-image-picker";
import { createContext, useContext } from "react";
import { Platform } from "react-native";
import { create, useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";

axiosRetry(axios, {
  retries: 3,
});

type Item = {
  id: string;
  file: File;
  uri: string;
  mimeType: string;
  name: string;
  size: number;
  processedBytes: number;
  abortController?: AbortController;
};

type State = {
  data: Item[];
};

type Action = {
  setData: (data: Item[]) => void;
  upload: (data: {
    images: ImagePickerAsset[];
    albumId?: string;
  }) => Promise<void>;
};

async function generateThumbnail(asset: {
  uri: string;
  mimeType?: string;
}): Promise<{ uri: string; thumbnailBlob: Blob }> {
  let uri = asset.uri;
  let thumbnailBlob: Blob | null = null;
  if (asset.mimeType?.startsWith("image")) {
    const manipulate = ImageManipulator.manipulate(asset.uri);
    const image = await manipulate.resize({ width: 800 }).renderAsync();
    const thumbnail = await image.saveAsync();
    thumbnailBlob = await fetch(thumbnail.uri).then((res) => res.blob());
  }

  if (asset.mimeType?.startsWith("video")) {
    if (Platform.OS === "web") {
      const video = document.createElement("video");
      video.src = asset.uri;
      await new Promise((resolve) => {
        video.addEventListener("loadeddata", () => {
          resolve(true);
        });
      });

      video.muted = true;
      video.currentTime = Math.min(1, video.duration / 2); // Seek to 1s or half duration if shorter
      await new Promise((resolve) =>
        video.addEventListener("seeked", () => resolve(true)),
      );

      // Play briefly to ensure frame is available
      await video.play();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      video.pause();

      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = (video.videoHeight / video.videoWidth) * 1024;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const image = canvas.toDataURL("image/jpeg");
      uri = image;
      thumbnailBlob = await fetch(image).then((res) => res.blob());
    }
  }

  if (!thumbnailBlob) {
    throw new Error("fail generate thumbnail");
  }

  return { uri, thumbnailBlob };
}

export const createUploadStore = () =>
  create<State & Action>((set) => {
    const createGalleryMutation = trpc.gallery.create.useMutation();
    const clientUtils = trpc.useUtils();

    return {
      data: [],
      setData: (data: Item[]) => set({ data }),
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
          };
        });

        const resolvedAssets = await Promise.all(assets);

        const key = await client.auth.me.query().then((me) => me.user.key);

        set((prev) => ({ data: [...prev.data, ...resolvedAssets] }));

        for await (const media of resolvedAssets) {
          const albumPath = sanitizeFilename(
            clientUtils.album.find.getData({ id: data.albumId ?? "" })?.name ??
              "unknown",
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
          await axios
            .put(uploadFile, media.file, {
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

                        clientUtils.gallery.get.invalidate();
                      },
                    },
                  );
                }
              },
            })
            .catch(() => {});
        }
      },
    };
  });

export type UploadStore = ReturnType<typeof createUploadStore>;
export const contextUpload = createContext<UploadStore | null>(null);
export const UploadProvider = contextUpload.Provider;

export const useUpload = () => {
  const store = useContext(contextUpload);
  if (!store) {
    throw new Error("useUpload must be used within a UploadProvider");
  }
  return useStore(
    store,
    useShallow((state) => state),
  );
};
