import { and, eq, isNull } from "drizzle-orm";
import { albums } from "../../db/schema";
import { protectedProcdure } from "../../middlewares/protected";
import { updateAlbumDto } from "./dto/update.dto";

export const update = protectedProcdure
	.input(updateAlbumDto)
	.mutation(async ({ ctx, input }) => {
		await ctx.db
			.update(albums)
			.set({
				name: input.name,
			})
			.where(
				and(
					eq(albums.id, input.id),
					eq(albums.user_id, ctx.user.id),
					isNull(albums.deleted_at),
				),
			);
	});
