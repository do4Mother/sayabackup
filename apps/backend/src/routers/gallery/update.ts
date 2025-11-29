import { and, eq, isNull } from "drizzle-orm";
import z from "zod";
import { gallery } from "../../db/schema";
import { protectedProcdure } from "../../middlewares/protected";

export const update = protectedProcdure
	.input(
		z.object({
			id: z.string(),
			albumId: z.string().nullable(),
			filePath: z.string().optional(),
		}),
	)
	.mutation(async ({ ctx, input }) => {
		await ctx.db
			.update(gallery)
			.set({
				album_id: input.albumId,
				file_path: input.filePath,
			})
			.where(
				and(
					eq(gallery.id, input.id),
					eq(gallery.user_id, ctx.user.id),
					isNull(gallery.deleted_at),
				),
			);
	});
