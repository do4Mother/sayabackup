import { and, Column, desc, lte, SQL } from "drizzle-orm";
import { SQLiteSelect } from "drizzle-orm/sqlite-core";

export function withPagination<T extends SQLiteSelect>(
	query: T,
	page: number,
	limit: number,
): T {
	return query.limit(limit).offset((page - 1) * limit);
}

export function withCursorPagination<T extends SQLiteSelect>(data: {
	query: T;
	column: Column;
	cursor: string | number | null | undefined;
	where?: SQL;
	limit: number;
}): T {
	if (data.cursor) {
		return data.query
			.limit(data.limit)
			.where(and(lte(data.column, data.cursor), data.where))
			.orderBy(desc(data.column));
	}
	return data.query.limit(data.limit).orderBy(desc(data.column));
}
