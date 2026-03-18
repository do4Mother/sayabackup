import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import { organization_members, organizations } from "../../db/schema";
import { protectedProcdure } from "../../middlewares/protected";
import { createOrgDto } from "./dto/create-org.dto";

export const create = protectedProcdure
	.input(createOrgDto)
	.mutation(async ({ ctx, input }) => {
		const [existing] = await ctx.db
			.select()
			.from(organizations)
			.where(
				and(
					eq(organizations.owner_id, ctx.user.id),
					isNull(organizations.deleted_at),
				),
			)
			.limit(1);

		if (existing) {
			throw new TRPCError({
				code: "CONFLICT",
				message: "You already own an organization",
			});
		}

		const [org] = await ctx.db
			.insert(organizations)
			.values({
				name: input.name,
				owner_id: ctx.user.id,
			})
			.returning();

		await ctx.db.insert(organization_members).values({
			organization_id: org.id,
			user_id: ctx.user.id,
			role: "owner",
		});

		return org;
	});
