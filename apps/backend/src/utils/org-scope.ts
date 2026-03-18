import { and, eq, isNull } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { organization_members } from "../db/schema";

/**
 * Returns all user IDs that share the same organization as the given user.
 * If the user is not in any org, returns only their own ID.
 */
export async function getOrgMemberIds(
	db: DrizzleD1Database,
	userId: number,
): Promise<number[]> {
	const [membership] = await db
		.select({ organization_id: organization_members.organization_id })
		.from(organization_members)
		.where(
			and(
				eq(organization_members.user_id, userId),
				isNull(organization_members.deleted_at),
			),
		)
		.limit(1);

	if (!membership) {
		return [userId];
	}

	const members = await db
		.select({ user_id: organization_members.user_id })
		.from(organization_members)
		.where(
			and(
				eq(
					organization_members.organization_id,
					membership.organization_id,
				),
				isNull(organization_members.deleted_at),
			),
		);

	return members.map((m) => m.user_id);
}
