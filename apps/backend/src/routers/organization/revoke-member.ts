import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import { organization_members, organizations } from "../../db/schema";
import { protectedProcdure } from "../../middlewares/protected";
import { revokeMemberDto } from "./dto/revoke-member.dto";

export const revokeMember = protectedProcdure
	.input(revokeMemberDto)
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
				message: "Only the organization owner can revoke members",
			});
		}

		// Cannot revoke the owner
		if (input.userId === ctx.user.id) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Cannot revoke the organization owner",
			});
		}

		const [member] = await ctx.db
			.select()
			.from(organization_members)
			.where(
				and(
					eq(
						organization_members.organization_id,
						input.organizationId,
					),
					eq(organization_members.user_id, input.userId),
					isNull(organization_members.deleted_at),
				),
			)
			.limit(1);

		if (!member) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Member not found",
			});
		}

		await ctx.db
			.update(organization_members)
			.set({ deleted_at: Date.now() })
			.where(eq(organization_members.id, member.id));
	});
