import { and, eq, isNull } from "drizzle-orm";
import z from "zod";
import { gallery } from "../../db/schema";
import { protectedProcdure } from "../../middlewares/protected";

export const remove = protectedProcdure
	.input(
		z.object({
			id: z.string(),
		}),
	)
	.mutation(async ({ ctx, input }) => {
		await ctx.db
			.update(gallery)
			.set({ deleted_at: Date.now() })
			.where(
				and(
					eq(gallery.id, input.id),
					eq(gallery.user_id, ctx.user.id),
					isNull(gallery.deleted_at),
				),
			);
	});
