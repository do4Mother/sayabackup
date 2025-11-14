import z from "zod";

export const updateAlbumDto = z.object({
	id: z.string().min(1),
	name: z.string().min(1).max(100),
});
