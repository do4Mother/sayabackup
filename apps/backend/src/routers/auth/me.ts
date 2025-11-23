import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import { users } from "../../db/schema";
import { protectedProcdure } from "../../middlewares/protected";
import { userDto } from "./dto/user.dto";

export const me = protectedProcdure.query(async ({ ctx }) => {
	const [user] = await ctx.db
		.select()
		.from(users)
		.where(and(eq(users.id, ctx.user.id), isNull(users.deleted_at)));

	if (!user) {
		throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
	}

	return { user: userDto({ masking: false }).parse(user) };
});
