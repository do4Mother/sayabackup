import { TRPCError } from "@trpc/server";
import { and, eq, getTableColumns, inArray, isNull, sql } from "drizzle-orm";
import z from "zod";
import { albums, gallery } from "../../db/schema";
import { protectedProcdure } from "../../middlewares/protected";
import { getOrgMemberIds } from "../../utils/org-scope";

export const find = protectedProcdure
	.input(z.object({ id: z.string() }))
	.query(async ({ ctx, input }) => {
		const memberIds = await getOrgMemberIds(ctx.db, ctx.user.id, ctx.organizationId);
		const [album] = await ctx.db
			.select({
				...getTableColumns(albums),
				total: sql<number>`COUNT(${gallery.id})`,
			})
			.from(albums)
			.leftJoin(
				gallery,
				and(eq(gallery.album_id, albums.id), isNull(gallery.deleted_at)),
			)
			.where(
				and(
					eq(albums.id, input.id),
					inArray(albums.user_id, memberIds),
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
