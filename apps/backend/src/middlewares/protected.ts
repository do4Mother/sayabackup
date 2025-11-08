import { TRPCError } from "@trpc/server";
import { jwtVerify } from "jose";
import { userDto } from "../routers/auth/dto/user.dto";
import { AUTH_COOKIE_NAME } from "../utils/constants";
import { publicProcedure } from "./public";

export const protectedProcdure = publicProcedure.use(async ({ ctx, next }) => {
	const start = performance.now();

	const getCookie = ctx.getCookie(AUTH_COOKIE_NAME);

	if (!getCookie) {
		throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
	}

	const secret = new TextEncoder().encode(ctx.env.JWT_SECRET);

	const { payload } = await jwtVerify(getCookie, secret).catch((error) => {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: `invalid JWT: ${error.message}`,
		});
	});

	const userPayload = userDto.safeParse(payload);

	if (!userPayload.success) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: userPayload.error.message,
		});
	}

	const response = await next({
		ctx: {
			...ctx,
			user: userPayload.data,
		},
	});

	const end = performance.now();
	const timing = end - start;
	console.log("query performance:", timing, "ms");

	return response;
});
