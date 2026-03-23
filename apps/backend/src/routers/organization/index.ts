import { router } from "../../trpc";
import { acceptInvitation } from "./accept-invitation";
import { create } from "./create";
import { list } from "./get";
import { getInvitation } from "./get-invitation";
import { getMembers } from "./get-members";
import { getPersonalOrg } from "./get-personal";
import { invite } from "./invite";
import { invitePersonal } from "./invite-personal";
import { revokeMember } from "./revoke-member";

export const organizationRouter = router({
	create,
	list,
	getMembers,
	invite,
	invitePersonal,
	getInvitation,
	acceptInvitation,
	revokeMember,
	getPersonalOrg,
});
