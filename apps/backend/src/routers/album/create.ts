import { albums } from "../../db/schema";
import { protectedProcdure } from "../../middlewares/protected";
import { createAlbumDto } from "./dto/create.dto";

export const create = protectedProcdure
	.input(createAlbumDto)
	.mutation(async ({ ctx, input }) => {
		return ctx.db
			.insert(albums)
			.values({
				user_id: ctx.user.id,
				name: input.name,
			})
			.returning()
			.then((res) => res[0]);
	});
