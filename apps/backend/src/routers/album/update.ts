import { and, eq, inArray, isNull } from "drizzle-orm";
import { albums } from "../../db/schema";
import { protectedProcdure } from "../../middlewares/protected";
import { getOrgMemberIds } from "../../utils/org-scope";
import { updateAlbumDto } from "./dto/update.dto";

export const update = protectedProcdure
	.input(updateAlbumDto)
	.mutation(async ({ ctx, input }) => {
		const memberIds = await getOrgMemberIds(ctx.db, ctx.user.id);
		await ctx.db
			.update(albums)
			.set({
				name: input.name,
			})
			.where(
				and(
					eq(albums.id, input.id),
					inArray(albums.user_id, memberIds),
					isNull(albums.deleted_at),
				),
			);
	});
