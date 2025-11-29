import { and, desc, eq, isNull, lte } from "drizzle-orm";
import { match, P } from "ts-pattern";
import z from "zod";
import { gallery } from "../../db/schema";
import { protectedProcdure } from "../../middlewares/protected";
import { defaultCursorParamsDto } from "../../utils/default_params";

export const get = protectedProcdure
	.input(
		defaultCursorParamsDto.extend({
			albumId: z.string().nullish(),
		}),
	)
	.query(async ({ ctx, input }) => {
		const items = await ctx.db
			.select()
			.from(gallery)
			.where(
				and(
					isNull(gallery.deleted_at),
					eq(gallery.user_id, ctx.user.id),
					match(input.albumId)
						.with(P.string, (v) => eq(gallery.album_id, v))
						.otherwise(() => undefined),
					match(input.cursor)
						.with(P.number, (v) => lte(gallery.created_at, v))
						.otherwise(() => undefined),
				),
			)
			.orderBy(desc(gallery.created_at));

		let nextCursor: string | null = null;

		if (items.length > input.limit) {
			const nextItem = items.pop();
			if (nextItem) {
				nextCursor = String(nextItem.created_at);
			}
		}

		return {
			items: items,
			nextCursor: nextCursor,
		};
	});
