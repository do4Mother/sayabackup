import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import z from "zod";
import { protectedProcdure } from "../../middlewares/protected";
import { createS3Client } from "../../utils/s3_client";
import { decryptS3Credentials } from "../auth/decrypt_s3";

export const upload = protectedProcdure
	.input(
		z.object({
			credentials: z.string(),
			path: z.string(),
			type: z.string(),
		}),
	)
	.mutation(async ({ input, ctx }) => {
		const { credentials } = input;

		const s3Credentials = decryptS3Credentials({
			encrypted: credentials,
			key: ctx.user.key,
			masking: false,
		});

		const client = createS3Client(s3Credentials);

		const originalPreSignedUrl = await getSignedUrl(
			client,
			new PutObjectCommand({
				Bucket: s3Credentials.bucket_name,
				Key: `originals/${input.path}`,
				ContentType: input.type,
			}),
		);

		const thumbnailPreSignedUrl = await getSignedUrl(
			client,
			new PutObjectCommand({
				Bucket: s3Credentials.bucket_name,
				Key: `thumbnails/${input.path}`,
				ContentType: input.type,
			}),
		);

		return {
			original: originalPreSignedUrl,
			thumbnail: thumbnailPreSignedUrl,
		};
	});
