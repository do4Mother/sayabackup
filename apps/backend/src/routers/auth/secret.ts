import { publicProcedure } from "../../middlewares/public";

export const secret = publicProcedure.query(async ({ ctx }) => {
	// generate a random secret value
	const secretValue = Math.random().toString(36).substring(2, 15);

	ctx.setCookie("google_auth_secret", secretValue, {
		httpOnly: true,
		secure: true,
		sameSite: "Strict",
	});

	return secretValue;
});
