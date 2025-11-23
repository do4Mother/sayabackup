import { protectedProcdure } from "../../middlewares/protected";
import { AUTH_COOKIE_NAME } from "../../utils/constants";

export const logout = protectedProcdure.mutation(async ({ ctx }) => {
	ctx.setCookie(AUTH_COOKIE_NAME, "");
});
