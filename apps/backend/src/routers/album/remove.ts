import { TRPCError } from "@trpc/server";
import { and, eq, inArray, isNull } from "drizzle-orm";
import z from "zod";
import { albums } from "../../db/schema";
import { protectedProcdure } from "../../middlewares/protected";
import { getOrgMemberIds } from "../../utils/org-scope";

export const remove = protectedProcdure
	.input(
		z.object({
			id: z.string(),
		}),
	)
	.mutation(async ({ ctx, input }) => {
		const memberIds = await getOrgMemberIds(ctx.db, ctx.user.id, ctx.organizationId);
		const [album] = await ctx.db
			.select()
			.from(albums)
			.where(
				and(
					eq(albums.id, input.id),
					inArray(albums.user_id, memberIds),
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
					inArray(albums.user_id, memberIds),
					isNull(albums.deleted_at),
				),
			);
	});
