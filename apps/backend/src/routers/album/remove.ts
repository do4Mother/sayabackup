import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import z from "zod";
import { albums } from "../../db/schema";
import { protectedProcdure } from "../../middlewares/protected";

export const remove = protectedProcdure
	.input(
		z.object({
			id: z.string(),
		}),
	)
	.mutation(async ({ ctx, input }) => {
		const [album] = await ctx.db
			.select()
			.from(albums)
			.where(
				and(
					eq(albums.id, input.id),
					eq(albums.user_id, ctx.user.id),
					isNull(albums.deleted_at),
				),
			);

		if (!album) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Album not found",
			});
		}

		await ctx.db
			.update(albums)
			.set({
				deleted_at: Date.now(),
			})
			.where(
				and(
					eq(albums.id, album.id),
					eq(albums.user_id, ctx.user.id),
					isNull(albums.deleted_at),
				),
			);
	});
