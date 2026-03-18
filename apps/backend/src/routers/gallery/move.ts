import { sanitizeFilename } from "@sayabackup/utils";
import { TRPCError } from "@trpc/server";
import { and, eq, inArray, isNull } from "drizzle-orm";
import z from "zod";
import { albums, gallery } from "../../db/schema";
import { protectedProcdure } from "../../middlewares/protected";
import { getOrgMemberIds } from "../../utils/org-scope";

export const move = protectedProcdure
	.input(z.object({ id: z.string(), albumId: z.string().nullish() }))
	.mutation(async ({ ctx, input }) => {
		const memberIds = await getOrgMemberIds(ctx.db, ctx.user.id);
		const [file] = await ctx.db
			.select()
			.from(gallery)
			.where(
				and(
					eq(gallery.id, input.id),
					inArray(gallery.user_id, memberIds),
					isNull(gallery.deleted_at),
				),
			);

		if (!file) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "File not found",
			});
		}

		let albumName = "unknown";

		if (input.albumId) {
			const [album] = await ctx.db
				.select()
				.from(albums)
				.where(
					and(
						eq(albums.id, input.albumId),
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

			albumName = album.name;
		}

		const safeAlbumName = sanitizeFilename(albumName); // Sanitize album name
		const filePath = file.file_path.split("/").slice(1); // Remove old album name
		const newFilePath = [safeAlbumName, ...filePath].join("/");

		return { newFilePath, oldFilePath: file.file_path };
	});
