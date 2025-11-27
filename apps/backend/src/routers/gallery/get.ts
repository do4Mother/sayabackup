import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { and, eq, isNull } from "drizzle-orm";
import { match, P } from "ts-pattern";
import z from "zod";
import { withCursorPagination } from "../../db/query.helper";
import { gallery } from "../../db/schema";
import { protectedWithS3 } from "../../middlewares/protected-with-s3";
import { defaultCursorParamsDto } from "../../utils/default_params";
import { freezeSignedUrl } from "../../utils/freeze_signed_url";
import { createS3Client } from "../../utils/s3_client";

export const get = protectedWithS3
	.input(
		defaultCursorParamsDto.extend({
			albumId: z.string().nullish(),
		}),
	)
	.query(async ({ ctx, input }) => {
		const s3Credentials = ctx.s3credentials;

		const client = createS3Client(s3Credentials);

		const query = ctx.db.select().from(gallery).$dynamic();

		const items = await withCursorPagination({
			query,
			column: gallery.created_at,
			cursor: input.cursor,
			limit: input.limit + 1,
			where: and(
				isNull(gallery.deleted_at),
				eq(gallery.user_id, ctx.user.id),
				match(input.albumId)
					.with(P.string, (v) => eq(gallery.album_id, v))
					.otherwise(() => undefined),
			),
		});

		/**
		 * Create presigned URLs for each gallery item
		 */
		const signedItems = await Promise.all(
			items.map(async (item) => {
				const thumbnailUrl = await freezeSignedUrl({
					url: item.thumbnail_path,
					ttlSeconds: 3600,
					newUrlCallback: async () => {
						return getSignedUrl(
							client,
							new GetObjectCommand({
								Bucket: s3Credentials.bucket_name,
								Key: item.thumbnail_path,
							}),
							{ expiresIn: 3600 }, // URL valid for 1 hour
						);
					},
				});

				return {
					...item,
					thumbnail_url: thumbnailUrl,
				};
			}),
		);

		let nextCursor: string | null = null;

		if (signedItems.length > input.limit) {
			const nextItem = signedItems.pop();
			if (nextItem) {
				nextCursor = String(nextItem.created_at);
			}
		}

		return {
			items: signedItems,
			nextCursor: nextCursor,
		};
	});
