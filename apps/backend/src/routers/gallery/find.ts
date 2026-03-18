import { TRPCError } from "@trpc/server";
import { and, eq, inArray, isNull } from "drizzle-orm";
import z from "zod";
import { gallery } from "../../db/schema";
import { protectedProcdure } from "../../middlewares/protected";
import { getOrgMemberIds } from "../../utils/org-scope";

export const find = protectedProcdure
	.input(z.object({ id: z.string() }))
	.query(async ({ ctx, input }) => {
		const memberIds = await getOrgMemberIds(ctx.db, ctx.user.id);
		const [item] = await ctx.db
			.select()
			.from(gallery)
			.where(
				and(
					eq(gallery.id, input.id),
					inArray(gallery.user_id, memberIds),
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
