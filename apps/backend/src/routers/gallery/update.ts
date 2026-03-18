import { and, eq, inArray, isNull } from "drizzle-orm";
import z from "zod";
import { gallery } from "../../db/schema";
import { protectedProcdure } from "../../middlewares/protected";
import { getOrgMemberIds } from "../../utils/org-scope";

export const update = protectedProcdure
	.input(
		z.object({
			id: z.string(),
			albumId: z.string().nullable(),
			filePath: z.string().optional(),
		}),
	)
	.mutation(async ({ ctx, input }) => {
		const memberIds = await getOrgMemberIds(ctx.db, ctx.user.id, ctx.organizationId);
		await ctx.db
			.update(gallery)
			.set({
				album_id: input.albumId,
				file_path: input.filePath,
			})
			.where(
				and(
					eq(gallery.id, input.id),
					inArray(gallery.user_id, memberIds),
					isNull(gallery.deleted_at),
				),
			);
	});
