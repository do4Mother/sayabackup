import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import z from "zod";
import { albums, gallery } from "../../db/schema";
import { protectedWithS3 } from "../../middlewares/protected-with-s3";
import { createS3Client } from "../../utils/s3_client";

export const remove = protectedWithS3
	.input(
		z.object({
			id: z.string(),
			withImages: z.boolean().nullish(),
		}),
	)
	.mutation(async ({ ctx, input }) => {
		const [album] = await ctx.db
			.select()
			.from(albums)
			.where(
				and(
					eq(albums.id, input.id),
					eq(albums.user_id, ctx.user.id),
					isNull(albums.deleted_at),
				),
			);

		if (!album) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Album not found",
			});
		}

		if (input.withImages) {
			const images = await ctx.db
				.select()
				.from(gallery)
				.where(
					and(
						eq(gallery.album_id, album.id),
						isNull(gallery.deleted_at),
						eq(gallery.user_id, ctx.user.id),
					),
				);

			const client = createS3Client(ctx.s3credentials);

			for (const image of images) {
				await client.send(
					new DeleteObjectCommand({
						Bucket: ctx.s3credentials.bucket_name,
						Key: image.file_path,
					}),
				);

				await ctx.db
					.update(gallery)
					.set({
						deleted_at: Date.now(),
					})
					.where(
						and(eq(gallery.id, image.id), eq(gallery.user_id, ctx.user.id)),
					);
			}
		}

		await ctx.db
			.update(albums)
			.set({
				deleted_at: Date.now(),
			})
			.where(
				and(
					eq(albums.id, album.id),
					eq(albums.user_id, ctx.user.id),
					isNull(albums.deleted_at),
				),
			);
	});
