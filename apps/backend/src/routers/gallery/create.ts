import { GetObjectCommand } from "@aws-sdk/client-s3";
import { gallery } from "../../db/schema";
import { protectedWithS3 } from "../../middlewares/protected-with-s3";
import { createS3Client } from "../../utils/s3_client";
import { createGalleryDto } from "./dto/create.dto";

export const create = protectedWithS3
	.input(createGalleryDto)
	.mutation(async ({ ctx, input }) => {
		// get mime type
		const client = createS3Client(ctx.s3credentials);

		const object = await client
			.send(
				new GetObjectCommand({
					Bucket: ctx.s3credentials.bucket_name,
					Key: input.filePath,
				}),
			)
			// if unable to get, fallback to input mime type
			.catch(() => ({ ContentType: input.mimeType }));

		await ctx.db.insert(gallery).values({
			file_path: input.filePath,
			thumbnail_path: input.thumbnailPath,
			user_id: ctx.user.id,
			album_id: input.albumId,
			mime_type: object.ContentType ?? "",
		});
	});
