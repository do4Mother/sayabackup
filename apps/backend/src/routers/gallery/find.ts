import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import z from "zod";
import { gallery } from "../../db/schema";
import { protectedProcdure } from "../../middlewares/protected";

export const find = protectedProcdure
	.input(z.object({ id: z.string() }))
	.query(async ({ ctx, input }) => {
		const [item] = await ctx.db
			.select()
			.from(gallery)
			.where(
				and(
					eq(gallery.id, input.id),
					eq(gallery.user_id, ctx.user.id),
					isNull(gallery.deleted_at),
				),
			);

		if (!item) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Photo not found",
			});
		}

		return item;
	});
