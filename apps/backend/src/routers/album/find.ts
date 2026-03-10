import { TRPCError } from "@trpc/server";
import { and, eq, getTableColumns, isNull, sql } from "drizzle-orm";
import z from "zod";
import { albums, gallery } from "../../db/schema";
import { protectedProcdure } from "../../middlewares/protected";

export const find = protectedProcdure
	.input(z.object({ id: z.string() }))
	.query(async ({ ctx, input }) => {
		const [album] = await ctx.db
			.select({
				...getTableColumns(albums),
				total: sql<number>`COUNT(${gallery.id})`,
			})
			.from(albums)
			.leftJoin(gallery, eq(gallery.album_id, albums.id))
			.where(
				and(
					eq(albums.id, input.id),
					eq(albums.user_id, ctx.user.id),
					isNull(albums.deleted_at),
				),
			)
			.groupBy(albums.id);

		if (!album) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Album not found",
			});
		}

		return album;
	});
