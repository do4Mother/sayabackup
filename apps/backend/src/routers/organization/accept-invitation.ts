import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import {
	organization_invitations,
	organization_members,
	organizations,
} from "../../db/schema";
import { protectedProcdure } from "../../middlewares/protected";
import { acceptInvitationDto } from "./dto/accept-invitation.dto";

export const acceptInvitation = protectedProcdure
	.input(acceptInvitationDto)
	.mutation(async ({ ctx, input }) => {
		const [invitation] = await ctx.db
			.select()
			.from(organization_invitations)
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

		if (invitation.accepted_at) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "This invitation has already been accepted",
			});
		}

		if (invitation.expires_at < Date.now()) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "This invitation link has expired",
			});
		}

		if (invitation.email !== ctx.user.email) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message:
					"This invitation was sent to a different email address",
			});
		}

		// Check user is not already a member of this specific org
		const [existingMembership] = await ctx.db
			.select()
			.from(organization_members)
			.where(
				and(
					eq(organization_members.user_id, ctx.user.id),
					eq(organization_members.organization_id, invitation.organization_id),
					isNull(organization_members.deleted_at),
				),
			)
			.limit(1);

		if (existingMembership) {
			throw new TRPCError({
				code: "CONFLICT",
				message: "You are already a member of this organization",
			});
		}

		// Insert member
		await ctx.db.insert(organization_members).values({
			organization_id: invitation.organization_id,
			user_id: ctx.user.id,
			role: "member",
		});

		// Mark invitation as accepted
		await ctx.db
			.update(organization_invitations)
			.set({ accepted_at: Date.now() })
			.where(
				and(
					eq(organization_invitations.id, invitation.id),
					isNull(organization_invitations.accepted_at),
				),
			);

		// Return the org
		const [org] = await ctx.db
			.select()
			.from(organizations)
			.where(eq(organizations.id, invitation.organization_id))
			.limit(1);

		return org;
	});
