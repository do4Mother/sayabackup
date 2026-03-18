import {
	and,
	desc,
	eq,
	getTableColumns,
	inArray,
	isNull,
	sql,
} from "drizzle-orm";
import { albums, gallery } from "../../db/schema";
import { protectedProcdure } from "../../middlewares/protected";
import { getOrgMemberIds } from "../../utils/org-scope";

export const getWithImage = protectedProcdure.query(async ({ ctx }) => {
	const memberIds = await getOrgMemberIds(ctx.db, ctx.user.id, ctx.organizationId);
	const albumsData = await ctx.db
		.select({
			...getTableColumns(albums),
			total: sql<number>`COUNT(${gallery.id})`,
		})
		.from(albums)
		.leftJoin(
			gallery,
			and(eq(gallery.album_id, albums.id), isNull(gallery.deleted_at)),
		)
		.where(and(inArray(albums.user_id, memberIds), isNull(albums.deleted_at)))
		.groupBy(albums.id)
		.orderBy(desc(albums.created_at));

	const albumsWithImage = await Promise.all(
		albumsData.map(async (album) => {
			const images = await ctx.db
				.select()
				.from(gallery)
				.where(
					and(
						eq(gallery.album_id, album.id),
						inArray(gallery.user_id, memberIds),
						isNull(gallery.deleted_at),
					),
				)
				.orderBy(desc(gallery.created_at))
				.limit(4)
				.then((res) =>
					res.map((item) => ({ id: item.id, url: item.thumbnail_path })),
				);

			return {
				...album,
				images: images || [],
			};
		}),
	);

	return albumsWithImage;
});
