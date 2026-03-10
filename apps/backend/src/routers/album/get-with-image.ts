import { and, desc, eq, getTableColumns, isNull, sql } from "drizzle-orm";
import { albums, gallery } from "../../db/schema";
import { protectedProcdure } from "../../middlewares/protected";

export const getWithImage = protectedProcdure.query(async ({ ctx }) => {
	const albumsData = await ctx.db
		.select({
			...getTableColumns(albums),
			total: sql<number>`COUNT(${gallery.id})`,
		})
		.from(albums)
		.leftJoin(gallery, eq(gallery.album_id, albums.id))
		.where(and(eq(albums.user_id, ctx.user.id), isNull(albums.deleted_at)))
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
						eq(gallery.user_id, ctx.user.id),
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
