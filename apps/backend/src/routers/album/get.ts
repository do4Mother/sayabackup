import { and, eq, isNull } from "drizzle-orm";
import { albums } from "../../db/schema";
import { protectedProcdure } from "../../middlewares/protected";

export const get = protectedProcdure.query(async ({ ctx }) => {
	return ctx.db
		.select()
		.from(albums)
		.where(and(isNull(albums.deleted_at), eq(albums.user_id, ctx.user.id)));
});
