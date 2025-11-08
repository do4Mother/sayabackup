import { int } from "drizzle-orm/sqlite-core";

export const timestampColumn = {
	created_at: int().$defaultFn(() => Date.now()),
	updated_at: int().$onUpdateFn(() => Date.now()),
	deleted_at: int(),
};
