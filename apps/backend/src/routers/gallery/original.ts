import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import z from "zod";
import { gallery } from "../../db/schema";
import { protectedWithS3 } from "../../middlewares/protected-with-s3";
import { createS3Client } from "../../utils/s3_client";

export const original = protectedWithS3
	.input(z.object({ id: z.string() }))
	.mutation(async ({ ctx, input }) => {
		const [file] = await ctx.db
			.select()
			.from(gallery)
			.where(
				and(
					eq(gallery.id, input.id),
					eq(gallery.user_id, ctx.user.id),
					isNull(gallery.deleted_at),
				),
			);

		if (!file) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "File not found",
			});
		}

		const client = createS3Client(ctx.s3credentials);
		const signedUrl = await getSignedUrl(
			client,
			new GetObjectCommand({
				Bucket: ctx.s3credentials.bucket_name,
				Key: file.file_path,
			}),
		);

		return signedUrl;
	});
