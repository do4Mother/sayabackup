import { initTRPC } from "@trpc/server";
import { DrizzleD1Database } from "drizzle-orm/d1";

type SetCookieOptions = {
	httpOnly?: boolean;
	secure?: boolean;
	sameSite?: "Strict" | "Lax" | "None";
	maxAge?: number;
};

export type Context = {
	env: Env;
	setCookie: (name: string, value: string, options?: SetCookieOptions) => void;
	getCookie: (name: string) => string | null;
	db: DrizzleD1Database;
};

export const t = initTRPC.context<Context>().create();
export const router = t.router;
