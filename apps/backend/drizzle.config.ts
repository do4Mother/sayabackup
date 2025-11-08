import { defineConfig } from "drizzle-kit";
import { env } from 'node:process';

const { LOCAL_DB_PATH } = env;

export default LOCAL_DB_PATH
	? defineConfig({
			schema: "./src/db/schema.ts",
			dialect: "sqlite",
			dbCredentials: {
				url: LOCAL_DB_PATH as string,
			},
		})
	: defineConfig({
			out: "./drizzle",
			schema: "./src/db/schema.ts",
			dialect: "sqlite",
			driver: "d1-http",
			dbCredentials: {
				accountId: env.CLOUDFLARE_ACCOUNT_ID ?? "",
				databaseId: env.CLOUDFLARE_DATABASE_ID ?? "",
				token: env.CLOUDFLARE_D1_TOKEN ?? "",
			},
		});
