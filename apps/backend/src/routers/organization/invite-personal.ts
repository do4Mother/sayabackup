import { randomString } from "@sayabackup/utils";
import { TRPCError } from "@trpc/server";
import { and, eq, gt, isNull } from "drizzle-orm";
import {
	organization_invitations,
	organization_members,
	users,
} from "../../db/schema";
import { protectedProcdure } from "../../middlewares/protected";
import { getOrCreatePersonalOrg } from "../../utils/personal-org";
import z from "zod";

export const invitePersonal = protectedProcdure
	.input(z.object({ email: z.string().email() }))
	.mutation(async ({ ctx, input }) => {
		const org = await getOrCreatePersonalOrg(ctx.db, ctx.user);

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
						eq(organization_members.organization_id, org.id),
						eq(organization_members.user_id, existingUser.id),
						isNull(organization_members.deleted_at),
					),
				)
				.limit(1);

			if (existingMember) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "This user already has access to your personal space",
				});
			}
		}

		// Check no pending invitation for same email
		const [pendingInvite] = await ctx.db
			.select()
			.from(organization_invitations)
			.where(
				and(
					eq(organization_invitations.organization_id, org.id),
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
				message: "A pending invitation already exists for this email",
			});
		}

		const token = randomString(48);
		const expiresAt = Date.now() + 3_600_000; // 1 hour

		await ctx.db.insert(organization_invitations).values({
			organization_id: org.id,
			invited_by: ctx.user.id,
			email: input.email,
			token,
			expires_at: expiresAt,
		});

		return { token };
	});
