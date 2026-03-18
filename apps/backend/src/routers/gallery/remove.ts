import { and, eq, inArray, isNull } from "drizzle-orm";
import z from "zod";
import { gallery } from "../../db/schema";
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
		await ctx.db
			.update(gallery)
			.set({ deleted_at: Date.now() })
			.where(
				and(
					eq(gallery.id, input.id),
					inArray(gallery.user_id, memberIds),
					isNull(gallery.deleted_at),
				),
			);
	});
