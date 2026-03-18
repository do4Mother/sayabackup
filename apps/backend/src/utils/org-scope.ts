import { and, eq, isNull } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { organization_members } from "../db/schema";

/**
 * Returns all user IDs that share the same organization as the given user.
 * If organizationId is provided, verifies the user is a member and returns that org's members.
 * If organizationId is null, returns only the user's own ID (personal mode).
 */
export async function getOrgMemberIds(
	db: DrizzleD1Database,
	userId: number,
	organizationId: string | null,
): Promise<number[]> {
	if (!organizationId) {
		return [userId];
	}

	const [membership] = await db
		.select({ organization_id: organization_members.organization_id })
		.from(organization_members)
		.where(
			and(
				eq(organization_members.user_id, userId),
				eq(organization_members.organization_id, organizationId),
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
				eq(organization_members.organization_id, organizationId),
				isNull(organization_members.deleted_at),
			),
		);

	return members.map((m) => m.user_id);
}
