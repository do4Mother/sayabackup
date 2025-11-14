import z from "zod";

export const createAlbumDto = z.object({
	name: z.string().min(1).max(100),
});
