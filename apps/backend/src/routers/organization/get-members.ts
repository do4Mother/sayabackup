import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import z from "zod";
import { organization_members, users } from "../../db/schema";
import { protectedProcdure } from "../../middlewares/protected";

export const getMembers = protectedProcdure
	.input(z.object({ organizationId: z.string() }))
	.query(async ({ ctx, input }) => {
		// Verify caller is a member
		const [callerMembership] = await ctx.db
			.select()
			.from(organization_members)
			.where(
				and(
					eq(organization_members.organization_id, input.organizationId),
					eq(organization_members.user_id, ctx.user.id),
					isNull(organization_members.deleted_at),
				),
			)
			.limit(1);

		if (!callerMembership) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "You are not a member of this organization",
			});
		}

		return ctx.db
			.select({
				id: users.id,
				email: users.email,
				role: organization_members.role,
			})
			.from(organization_members)
			.innerJoin(users, eq(organization_members.user_id, users.id))
			.where(
				and(
					eq(organization_members.organization_id, input.organizationId),
					isNull(organization_members.deleted_at),
				),
			);
	});
