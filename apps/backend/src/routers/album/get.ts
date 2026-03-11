import { and, eq, getTableColumns, isNull, sql } from "drizzle-orm";
import { albums, gallery } from "../../db/schema";
import { protectedProcdure } from "../../middlewares/protected";

export const get = protectedProcdure.query(async ({ ctx }) => {
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
		.where(and(isNull(albums.deleted_at), eq(albums.user_id, ctx.user.id)))
		.groupBy(albums.id);
});
