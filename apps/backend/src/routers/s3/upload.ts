import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { protectedWithS3 } from "../../middlewares/protected-with-s3";
import { createS3Client } from "../../utils/s3_client";
import sanitizeFileName from "../../utils/sanitize_file_name";

export const upload = protectedWithS3
	.input(
		z.object({
			path: z.string(),
			type: z.string(),
			album: z.string().nullish(),
		}),
	)
	.mutation(async ({ input, ctx }) => {
		const client = createS3Client(ctx.s3credentials);

		// sanitize file name
		const pathParts = input.path.split("/");
		const fileName = pathParts.pop();

		if (!fileName) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Invalid file name",
			});
		}

		const albumPath = input.album ? `${input.album.replaceAll(" ", "_")}/` : "";
		const sanitizedFileName = sanitizeFileName(fileName);
		const sanitizedPath = [...pathParts, sanitizedFileName].join("/");
		const originalPath = `${albumPath === "" ? "raw/" : albumPath}${sanitizedPath}`;

		const originalPreSignedUrl = await getSignedUrl(
			client,
			new PutObjectCommand({
				Bucket: ctx.s3credentials.bucket_name,
				Key: originalPath,
				ContentType: input.type,
			}),
		);

		const thumbnailPath = `thumbnails/${sanitizedPath}`;

		const thumbnailPreSignedUrl = await getSignedUrl(
			client,
			new PutObjectCommand({
				Bucket: ctx.s3credentials.bucket_name,
				Key: thumbnailPath,
				ContentType: input.type,
			}),
		);

		return {
			original_path: originalPath,
			original: originalPreSignedUrl,
			thumbnail_path: thumbnailPath,
			thumbnail: thumbnailPreSignedUrl,
		};
	});
