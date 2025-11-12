import { gallery } from "../../db/schema";
import { protectedProcdure } from "../../middlewares/protected";
import { createGalleryDto } from "./dto/create.dto";

export const create = protectedProcdure
	.input(createGalleryDto)
	.mutation(async ({ ctx, input }) => {
		await ctx.db.insert(gallery).values({
			file_path: input.filePath,
			thumbnail_path: input.thumbnailPath,
			user_id: ctx.user.id,
			album_id: input.albumId,
		});
	});
