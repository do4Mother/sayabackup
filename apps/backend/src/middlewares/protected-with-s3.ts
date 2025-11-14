import { TRPCError } from "@trpc/server";
import { decryptS3Credentials } from "../routers/auth/decrypt_s3";
import { protectedProcdure } from "./protected";

export const protectedWithS3 = protectedProcdure.use(async ({ ctx, next }) => {
	const s3credentials = ctx.request.headers.get("x-s3-credentials");
	if (!s3credentials) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Missing S3 credentials",
		});
	}

	const decrypt = decryptS3Credentials({
		encrypted: s3credentials,
		key: ctx.user.key,
		masking: false,
	});

	return next({
		ctx: {
			...ctx,
			s3credentials: decrypt,
		},
	});
});
