import { randomString } from "@sayabackup/utils";
import { and, eq, isNull } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { organization_members, organizations } from "../db/schema";

export async function getOrCreatePersonalOrg(
	db: DrizzleD1Database,
	user: { id: number; email: string },
) {
	const [existing] = await db
		.select()
		.from(organizations)
		.where(
			and(
				eq(organizations.owner_id, user.id),
				eq(organizations.is_personal, 1),
				isNull(organizations.deleted_at),
			),
		)
		.limit(1);

	if (existing) {
		return existing;
	}

	const [org] = await db
		.insert(organizations)
		.values({
			name: `${user.email}'s Space`,
			owner_id: user.id,
			key: randomString(32),
			is_personal: 1,
		})
		.returning();

	await db.insert(organization_members).values({
		organization_id: org.id,
		user_id: user.id,
		role: "owner",
	});

	return org;
}
