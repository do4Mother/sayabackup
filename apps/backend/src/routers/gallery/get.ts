import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { and, eq, isNull } from "drizzle-orm";
import z from "zod";
import { gallery } from "../../db/schema";
import { protectedProcdure } from "../../middlewares/protected";
import { createS3Client } from "../../utils/s3_client";
import { decryptS3Credentials } from "../auth/decrypt_s3";

export const get = protectedProcdure
	.input(
		z.object({
			credentials: z.string(),
		}),
	)
	.query(async ({ ctx, input }) => {
		const s3Credentials = decryptS3Credentials({
			encrypted: input.credentials,
			key: ctx.user.key,
			masking: false,
		});

		const client = createS3Client(s3Credentials);

		const items = await ctx.db
			.select()
			.from(gallery)
			.where(and(isNull(gallery.deleted_at), eq(gallery.user_id, ctx.user.id)));

		/**
		 * Create presigned URLs for each gallery item
		 */
		const signedItems = await Promise.all(
			items.map(async (item) => {
				const thumbnailUrl = await getSignedUrl(
					client,
					new GetObjectCommand({
						Bucket: s3Credentials.bucket_name,
						Key: item.thumbnail_path,
					}),
					{ expiresIn: 3600 }, // URL valid for 1 hour
				);

				return {
					...item,
					thumbnail_url: thumbnailUrl,
				};
			}),
		);

		return signedItems;
	});
