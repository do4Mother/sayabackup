import z from "zod";

export const createGalleryDto = z.object({
	filePath: z.string().min(1),
	thumbnailPath: z.string().min(1),
	mimeType: z.string().optional(),
	albumId: z.string().optional(),
});
