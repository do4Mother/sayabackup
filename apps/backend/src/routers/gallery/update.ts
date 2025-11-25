import { CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";
import { and, eq, getTableColumns, isNull } from "drizzle-orm";
import { match, P } from "ts-pattern";
import z from "zod";
import { albums, gallery } from "../../db/schema";
import { protectedWithS3 } from "../../middlewares/protected-with-s3";
import { createS3Client } from "../../utils/s3_client";

export const update = protectedWithS3
	.input(
		z.object({
			id: z.string(),
			albumId: z.string().nullable(),
		}),
	)
	.mutation(async ({ ctx, input }) => {
		const [photo] = await ctx.db
			.select({
				...getTableColumns(gallery),
				album: albums.name,
			})
			.from(gallery)
			.leftJoin(albums, eq(gallery.album_id, albums.id))
			.where(
				and(
					eq(gallery.id, input.id),
					eq(gallery.user_id, ctx.user.id),
					isNull(gallery.deleted_at),
				),
			);

		if (!photo) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Photo not found",
			});
		}

		let newAlbum: { id: string; name: string } | undefined;

		if (input.albumId) {
			const [album] = await ctx.db
				.select()
				.from(albums)
				.where(
					and(
						eq(albums.id, input.albumId),
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

			newAlbum = album;
		}

		const client = createS3Client(ctx.s3credentials);
		const albumNameSafe = match(newAlbum)
			.with({ name: P.string }, (a) => a.name.replaceAll(" ", "_"))
			.otherwise(() => "raw");
		const newFilePath = match(photo.file_path)
			.with(P.string.startsWith(`${photo.album}/`), (value) => {
				return value.replace(`${photo.album}/`, `${albumNameSafe}/`);
			})
			.with(
				P.string.startsWith("originals/").or(P.string.startsWith("raw/")),
				(value) => {
					return value
						.replace("originals/", `${albumNameSafe}/`)
						.replace("raw/", `${albumNameSafe}/`);
				},
			)
			.otherwise(() => photo.file_path);

		console.log("Old file path:", photo.file_path);

		console.log("New file path:", newFilePath);

		/**
		 * Copy photo to album folder
		 */
		const copyCommand = new CopyObjectCommand({
			Bucket: ctx.s3credentials.bucket_name,
			CopySource: `${ctx.s3credentials.bucket_name}/${photo.file_path}`,
			Key: newFilePath,
		});

		await client.send(copyCommand).catch((error) => {
			console.log("aws s3 copy error:", error);
		});

		/**
		 * Delete original files
		 */
		await client.send(
			new DeleteObjectCommand({
				Bucket: ctx.s3credentials.bucket_name,
				Key: photo.file_path,
			}),
		);

		await ctx.db
			.update(gallery)
			.set({
				album_id: input.albumId,
				file_path: newFilePath,
			})
			.where(
				and(
					eq(gallery.id, input.id),
					eq(gallery.user_id, ctx.user.id),
					isNull(gallery.deleted_at),
				),
			);
	});
