import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import z from "zod";
import { protectedProcdure } from "../../middlewares/protected";
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

		const s3 = new S3Client({
			endpoint: s3Credentials.endpoint,
			region: s3Credentials.region,
			credentials: {
				accessKeyId: s3Credentials.access_key_id,
				secretAccessKey: s3Credentials.secret_access_key,
			},
		});

		const originalPreSignedUrl = await getSignedUrl(
			s3,
			new PutObjectCommand({
				Bucket: s3Credentials.bucket_name,
				Key: input.path,
				ContentType: input.type,
			}),
		);

		const thumbnailPreSignedUrl = await getSignedUrl(
			s3,
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
