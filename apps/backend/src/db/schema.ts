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
