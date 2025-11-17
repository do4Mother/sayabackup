import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { and, eq, isNull } from "drizzle-orm";
import z from "zod";
import { gallery } from "../../db/schema";
import { protectedWithS3 } from "../../middlewares/protected-with-s3";
import { createS3Client } from "../../utils/s3_client";

export const remove = protectedWithS3
	.input(
		z.object({
			ids: z.array(z.string()),
		}),
	)
	.mutation(async ({ ctx, input }) => {
		const client = createS3Client(ctx.s3credentials);

		for (const id of input.ids) {
			const [item] = await ctx.db
				.select()
				.from(gallery)
				.where(
					and(
						eq(gallery.id, id),
						eq(gallery.user_id, ctx.user.id),
						isNull(gallery.deleted_at),
					),
				);

			await client.send(
				new DeleteObjectCommand({
					Bucket: ctx.s3credentials.bucket_name,
					Key: item.file_path,
				}),
			);

			await ctx.db
				.update(gallery)
				.set({ deleted_at: Date.now() })
				.where(
					and(
						eq(gallery.id, id),
						eq(gallery.user_id, ctx.user.id),
						isNull(gallery.deleted_at),
					),
				);
		}
	});
