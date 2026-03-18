import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import z from "zod";
import {
	organization_invitations,
	organizations,
	users,
} from "../../db/schema";
import { publicProcedure } from "../../middlewares/public";

export const getInvitation = publicProcedure
	.input(z.object({ token: z.string() }))
	.query(async ({ ctx, input }) => {
		const [invitation] = await ctx.db
			.select({
				orgName: organizations.name,
				invitedByEmail: users.email,
				email: organization_invitations.email,
				expiresAt: organization_invitations.expires_at,
				acceptedAt: organization_invitations.accepted_at,
			})
			.from(organization_invitations)
			.innerJoin(
				organizations,
				eq(
					organization_invitations.organization_id,
					organizations.id,
				),
			)
			.innerJoin(
				users,
				eq(organization_invitations.invited_by, users.id),
			)
			.where(
				and(
					eq(organization_invitations.token, input.token),
					isNull(organization_invitations.deleted_at),
				),
			)
			.limit(1);

		if (!invitation) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Invitation not found",
			});
		}

		if (invitation.acceptedAt) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "This invitation has already been accepted",
			});
		}

		if (invitation.expiresAt < Date.now()) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "This invitation link has expired",
			});
		}

		return {
			orgName: invitation.orgName,
			invitedByEmail: invitation.invitedByEmail,
			email: invitation.email,
		};
	});
