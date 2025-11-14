import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import z from "zod";
import { albums } from "../../db/schema";
import { protectedProcdure } from "../../middlewares/protected";

export const find = protectedProcdure
	.input(z.object({ id: z.string() }))
	.query(async ({ ctx, input }) => {
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

		return album;
	});
