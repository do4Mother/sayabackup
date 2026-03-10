import { ImageManipulator } from "expo-image-manipulator";
import { Platform } from "react-native";

export async function generateThumbnail(asset: {
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
			video.preload = "auto";
			video.muted = true;
			video.playsInline = true;
			video.crossOrigin = "anonymous";
			video.src = asset.uri;

			await new Promise<void>((resolve, reject) => {
				video.addEventListener("loadedmetadata", () => resolve(), {
					once: true,
				});
				video.addEventListener("error", () => reject(video.error), {
					once: true,
				});
			});

			// Seek to 1s or half duration if shorter
			video.currentTime = Math.min(1, video.duration / 2);

			await new Promise<void>((resolve, reject) => {
				video.addEventListener("seeked", () => resolve(), { once: true });
				video.addEventListener("error", () => reject(video.error), {
					once: true,
				});
			});

			// Wait for the frame to be fully rendered
			await new Promise((resolve) => setTimeout(resolve, 200));

			const canvas = document.createElement("canvas");
			canvas.width = 1024;
			canvas.height = (video.videoHeight / video.videoWidth) * 1024;
			const ctx = canvas.getContext("2d");
			ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
			const image = canvas.toDataURL("image/jpeg");
			uri = image;
			thumbnailBlob = await fetch(image).then((res) => res.blob());

			// Clean up
			video.removeAttribute("src");
			video.load();
		}
	}

	if (!thumbnailBlob) {
		throw new Error("fail generate thumbnail");
	}

	return { uri, thumbnailBlob };
}
