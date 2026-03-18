import { and, eq, isNull } from "drizzle-orm";
import { organization_members, organizations } from "../../db/schema";
import { protectedProcdure } from "../../middlewares/protected";

export const list = protectedProcdure.query(async ({ ctx }) => {
	const results = await ctx.db
		.select({
			id: organizations.id,
			name: organizations.name,
			owner_id: organizations.owner_id,
			created_at: organizations.created_at,
			role: organization_members.role,
			key: organizations.key,
		})
		.from(organization_members)
		.innerJoin(
			organizations,
			eq(organization_members.organization_id, organizations.id),
		)
		.where(
			and(
				eq(organization_members.user_id, ctx.user.id),
				isNull(organization_members.deleted_at),
				isNull(organizations.deleted_at),
			),
		);

	return results;
});
