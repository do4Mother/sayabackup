import { router } from "../../trpc";
import { acceptInvitation } from "./accept-invitation";
import { create } from "./create";
import { get } from "./get";
import { getInvitation } from "./get-invitation";
import { getMembers } from "./get-members";
import { invite } from "./invite";
import { revokeMember } from "./revoke-member";

export const organizationRouter = router({
	create,
	get,
	getMembers,
	invite,
	getInvitation,
	acceptInvitation,
	revokeMember,
});
