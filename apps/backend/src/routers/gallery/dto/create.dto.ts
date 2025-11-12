import z from "zod";

export const createGalleryDto = z.object({
	filePath: z.string().min(1),
	thumbnailPath: z.string().min(1),
	albumId: z.string().optional(),
});
