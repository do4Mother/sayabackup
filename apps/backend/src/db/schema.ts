import { relations } from 'drizzle-orm';
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { timestampColumn } from './column.helper';

export const users = sqliteTable("users", {
  id: int().primaryKey(),
  ...timestampColumn,
  email: int().notNull().unique(),
})

export const user_providers = sqliteTable("user_providers", {
  id: int().primaryKey(),
  ...timestampColumn,
  user_id: int().notNull().references(() => users.id),
  provider: text().notNull(),
  provider_user_id: text().notNull(),
})

export const userProviderRelations = relations(users, ({ many }) => ({
  providers: many(user_providers)
}))
