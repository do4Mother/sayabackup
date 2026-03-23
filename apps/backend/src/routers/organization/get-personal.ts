import { protectedProcdure } from "../../middlewares/protected";
import { getOrCreatePersonalOrg } from "../../utils/personal-org";

export const getPersonalOrg = protectedProcdure.query(async ({ ctx }) => {
	return getOrCreatePersonalOrg(ctx.db, ctx.user);
});
