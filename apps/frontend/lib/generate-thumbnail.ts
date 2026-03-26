import { ALL_FORMATS, BlobSource, CanvasSink, Input } from "mediabunny";
import { ImageManipulator } from "expo-image-manipulator";

export async function generateThumbnail(asset: {
	uri: string;
	mimeType?: string;
	file?: Blob;
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
		if (!asset.file) {
			throw new Error("file blob required for video thumbnail generation");
		}
		const input = new Input({
			source: new BlobSource(asset.file),
			formats: ALL_FORMATS,
		});
		const track = await input.getPrimaryVideoTrack();
		if (!track) {
			throw new Error("no video track found");
		}
		const sink = new CanvasSink(track, { width: 800 });
		const result = await sink.getCanvas(1.0);
		if (!result) {
			throw new Error("could not extract video frame");
		}
		const { canvas } = result;
		if (canvas instanceof OffscreenCanvas) {
			thumbnailBlob = await canvas.convertToBlob({ type: "image/jpeg" });
		} else {
			thumbnailBlob = await new Promise<Blob>((resolve, reject) =>
				canvas.toBlob(
					(b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
					"image/jpeg",
				),
			);
		}
	}

	if (!thumbnailBlob) {
		throw new Error("fail generate thumbnail");
	}

	return { uri, thumbnailBlob };
}
