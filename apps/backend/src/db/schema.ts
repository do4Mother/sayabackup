import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { timestampColumn } from "./column.helper";

export const users = sqliteTable("users", {
	id: int().primaryKey(),
	...timestampColumn,
	email: text().notNull().unique(),
	key: text().notNull(),
});

export const user_providers = sqliteTable("user_providers", {
	id: int().primaryKey(),
	...timestampColumn,
	user_id: int()
		.notNull()
		.references(() => users.id),
	provider: text().notNull(),
	provider_user_id: text().notNull(),
});

export const userProviderRelations = relations(users, ({ many }) => ({
	providers: many(user_providers),
}));

export const gallery = sqliteTable("gallery", {
	id: text()
		.notNull()
		.$defaultFn(() => nanoid())
		.primaryKey(),
	...timestampColumn,
	user_id: int()
		.notNull()
		.references(() => users.id),
	file_path: text().notNull(),
	thumbnail_path: text().notNull(),
	mime_type: text(),
	album_id: text().references(() => albums.id),
});

export const galleryRelations = relations(gallery, ({ one }) => ({
	user: one(users, {
		fields: [gallery.user_id],
		references: [users.id],
	}),
	album: one(albums, {
		fields: [gallery.album_id],
		references: [albums.id],
	}),
}));

export const albums = sqliteTable("albums", {
	id: text()
		.notNull()
		.$defaultFn(() => nanoid())
		.primaryKey(),
	...timestampColumn,
	user_id: int()
		.notNull()
		.references(() => users.id),
	name: text().notNull(),
});

export const albumRelations = relations(albums, ({ many }) => ({
	images: many(gallery),
}));

// ── Organization ──────────────────────────────────────────────────────

export const organizations = sqliteTable("organizations", {
	id: text()
		.notNull()
		.$defaultFn(() => nanoid())
		.primaryKey(),
	...timestampColumn,
	name: text().notNull(),
	owner_id: int()
		.notNull()
		.references(() => users.id),
	key: text().notNull(),
});

export const organization_members = sqliteTable("organization_members", {
	id: int().primaryKey(),
	...timestampColumn,
	organization_id: text()
		.notNull()
		.references(() => organizations.id),
	user_id: int()
		.notNull()
		.references(() => users.id),
	role: text().notNull().default("member"),
});

export const organization_invitations = sqliteTable("organization_invitations", {
	id: int().primaryKey(),
	...timestampColumn,
	organization_id: text()
		.notNull()
		.references(() => organizations.id),
	invited_by: int()
		.notNull()
		.references(() => users.id),
	email: text().notNull(),
	token: text().notNull().unique(),
	expires_at: int().notNull(),
	accepted_at: int(),
});

export const organizationRelations = relations(organizations, ({ many, one }) => ({
	members: many(organization_members),
	invitations: many(organization_invitations),
	owner: one(users, {
		fields: [organizations.owner_id],
		references: [users.id],
	}),
}));

export const organizationMemberRelations = relations(
	organization_members,
	({ one }) => ({
		organization: one(organizations, {
			fields: [organization_members.organization_id],
			references: [organizations.id],
		}),
		user: one(users, {
			fields: [organization_members.user_id],
			references: [users.id],
		}),
	}),
);

export const organizationInvitationRelations = relations(
	organization_invitations,
	({ one }) => ({
		organization: one(organizations, {
			fields: [organization_invitations.organization_id],
			references: [organizations.id],
		}),
		invitedByUser: one(users, {
			fields: [organization_invitations.invited_by],
			references: [users.id],
		}),
	}),
);
