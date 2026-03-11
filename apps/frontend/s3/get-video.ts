import * as Crypto from "expo-crypto";
import { File, Paths } from "expo-file-system";
import { Platform } from "react-native";
import { getFile } from "./get_file";

const downloadCache = new Map<string, Promise<string>>();

type GetVideoOptions = {
	path: string;
	key: string;
};

export const getVideo = async (options: GetVideoOptions): Promise<string> => {
	const videoUrl = options.path;

	if (Platform.OS === "web") {
		const video = await getFile({ key: options.key, path: videoUrl });
		return video.url;
	}

	try {
		// Already local?
		if (
			videoUrl.startsWith("file://") ||
			videoUrl.startsWith(Paths.document.uri)
		) {
			return videoUrl;
		}

		// Strip query string (normalize URL)
		const cleanUrl = videoUrl.split("?")[0];

		// Hash the clean URL
		const hash = await Crypto.digestStringAsync(
			Crypto.CryptoDigestAlgorithm.SHA256,
			cleanUrl,
		);

		const fileExtension = cleanUrl.split(".").pop() || "mp4";
		const fileName = `video_${hash}.${fileExtension}`;
		const file = new File(Paths.document, fileName);

		// Check if already downloaded
		const fileInfo = file.info();
		if (fileInfo.exists && fileInfo.size && fileInfo.size > 0) {
			console.log("✅ Video cached:", file.uri);
			return file.uri;
		}

		// Avoid duplicate download
		if (downloadCache.has(videoUrl)) {
			return await downloadCache.get(videoUrl)!;
		}

		const getPresignedURL = await getFile({ key: options.key, path: videoUrl });

		const downloadPromise = downloadVideo(getPresignedURL.url, file);
		downloadCache.set(videoUrl, downloadPromise);

		const result = await downloadPromise;
		downloadCache.delete(videoUrl);

		return result;
	} catch (error) {
		console.error("❌ Video processing failed:", error);
		downloadCache.delete(videoUrl);
		return videoUrl;
	}
};

const downloadVideo = async (videoUrl: string, file: File): Promise<string> => {
	try {
		const res = await fetch(videoUrl, {
			headers: {
				"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
				Accept: "video/mp4,video/*;q=0.9,*/*;q=0.8",
				"Accept-Encoding": "identity",
			},
		});

		if (!res.ok) {
			throw new Error(`Network request failed with status ${res.status}`);
		}

		const arrayBuffer = await res.arrayBuffer();
		const bytes = new Uint8Array(arrayBuffer);

		if (bytes.length === 0) {
			throw new Error("Downloaded file is empty.");
		}

		await file.write(bytes);

		const info = await file.info();
		if (info.exists && info.size && info.size > 0) {
			console.log("📥 Video downloaded:", file.uri);
			return file.uri;
		} else {
			try {
				file.delete();
			} catch {}
			throw new Error("Downloaded file is empty after write.");
		}
	} catch (err) {
		console.error("❌ Download failed:", err);
		try {
			file.delete();
		} catch {}
		return videoUrl;
	}
};
