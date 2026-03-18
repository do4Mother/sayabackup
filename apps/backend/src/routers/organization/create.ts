import { randomString } from "@sayabackup/utils";
import { organization_members, organizations } from "../../db/schema";
import { protectedProcdure } from "../../middlewares/protected";
import { createOrgDto } from "./dto/create-org.dto";

export const create = protectedProcdure
	.input(createOrgDto)
	.mutation(async ({ ctx, input }) => {
		const [org] = await ctx.db
			.insert(organizations)
			.values({
				name: input.name,
				owner_id: ctx.user.id,
				key: randomString(32),
			})
			.returning();

		await ctx.db.insert(organization_members).values({
			organization_id: org.id,
			user_id: ctx.user.id,
			role: "owner",
		});

		return org;
	});
