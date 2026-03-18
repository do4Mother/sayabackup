import { and, eq, getTableColumns, inArray, isNull, sql } from "drizzle-orm";
import { albums, gallery } from "../../db/schema";
import { protectedProcdure } from "../../middlewares/protected";
import { getOrgMemberIds } from "../../utils/org-scope";

export const get = protectedProcdure.query(async ({ ctx }) => {
	const memberIds = await getOrgMemberIds(ctx.db, ctx.user.id);
	return ctx.db
		.select({
			...getTableColumns(albums),
			total: sql<number>`COUNT (${gallery.id})`,
		})
		.from(albums)
		.leftJoin(
			gallery,
			and(eq(gallery.album_id, albums.id), isNull(gallery.deleted_at)),
		)
		.where(and(isNull(albums.deleted_at), inArray(albums.user_id, memberIds)))
		.groupBy(albums.id);
});
