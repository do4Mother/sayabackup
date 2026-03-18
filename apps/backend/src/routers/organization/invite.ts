import { randomString } from "@sayabackup/utils";
import { TRPCError } from "@trpc/server";
import { and, eq, gt, isNull } from "drizzle-orm";
import {
	organization_invitations,
	organization_members,
	organizations,
	users,
} from "../../db/schema";
import { protectedProcdure } from "../../middlewares/protected";
import { inviteDto } from "./dto/invite.dto";

export const invite = protectedProcdure
	.input(inviteDto)
	.mutation(async ({ ctx, input }) => {
		// Verify caller is owner
		const [org] = await ctx.db
			.select()
			.from(organizations)
			.where(
				and(
					eq(organizations.id, input.organizationId),
					eq(organizations.owner_id, ctx.user.id),
					isNull(organizations.deleted_at),
				),
			)
			.limit(1);

		if (!org) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Only the organization owner can invite members",
			});
		}

		// Check email is not already a member
		const [existingUser] = await ctx.db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.email, input.email))
			.limit(1);

		if (existingUser) {
			const [existingMember] = await ctx.db
				.select()
				.from(organization_members)
				.where(
					and(
						eq(
							organization_members.organization_id,
							input.organizationId,
						),
						eq(organization_members.user_id, existingUser.id),
						isNull(organization_members.deleted_at),
					),
				)
				.limit(1);

			if (existingMember) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "This user is already a member of the organization",
				});
			}
		}

		// Check no pending invitation for same email+org
		const [pendingInvite] = await ctx.db
			.select()
			.from(organization_invitations)
			.where(
				and(
					eq(
						organization_invitations.organization_id,
						input.organizationId,
					),
					eq(organization_invitations.email, input.email),
					isNull(organization_invitations.accepted_at),
					gt(organization_invitations.expires_at, Date.now()),
					isNull(organization_invitations.deleted_at),
				),
			)
			.limit(1);

		if (pendingInvite) {
			throw new TRPCError({
				code: "CONFLICT",
				message:
					"A pending invitation already exists for this email",
			});
		}

		const token = randomString(48);
		const expiresAt = Date.now() + 3_600_000; // 1 hour

		await ctx.db.insert(organization_invitations).values({
			organization_id: input.organizationId,
			invited_by: ctx.user.id,
			email: input.email,
			token,
			expires_at: expiresAt,
		});

		return { token };
	});
