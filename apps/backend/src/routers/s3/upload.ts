import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import z from "zod";
import { protectedWithS3 } from "../../middlewares/protected-with-s3";
import { createS3Client } from "../../utils/s3_client";

export const upload = protectedWithS3
	.input(
		z.object({
			path: z.string(),
			type: z.string(),
		}),
	)
	.mutation(async ({ input, ctx }) => {
		const client = createS3Client(ctx.s3credentials);

		const originalPreSignedUrl = await getSignedUrl(
			client,
			new PutObjectCommand({
				Bucket: ctx.s3credentials.bucket_name,
				Key: `originals/${input.path}`,
				ContentType: input.type,
			}),
		);

		const thumbnailPreSignedUrl = await getSignedUrl(
			client,
			new PutObjectCommand({
				Bucket: ctx.s3credentials.bucket_name,
				Key: `thumbnails/${input.path}`,
				ContentType: input.type,
			}),
		);

		return {
			original: originalPreSignedUrl,
			thumbnail: thumbnailPreSignedUrl,
		};
	});
