/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const corsHeaders = {
	"Access-Control-Allow-Origin": "http://localhost:8081", // Replace with your frontend's actual origin
	"Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, x-s3-credentials", // Add any custom headers your frontend sends
	"Access-Control-Max-Age": "86400", // Cache preflight results for 24 hours
	"Access-Control-Allow-Credentials": "true", // If you need to send cookies or authentication headers
};

import { decrypt, encrypt } from "@sayabackup/utils";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { drizzle } from "drizzle-orm/d1";
import { appRouter } from "./routers/routers";

export default {
	async fetch(request, env): Promise<Response> {
		// Handle OPTIONS requests (CORS preflight)
		if (request.method === "OPTIONS") {
			return new Response(null, { status: 204, headers: corsHeaders });
		}

		// Add CORS headers to all responses
		const newHeaders = new Headers();
		for (const [key, value] of Object.entries(corsHeaders)) {
			newHeaders.set(key, value);
		}

		// Handle tRPC requests
		const response = await fetchRequestHandler({
			req: request,
			endpoint: "/trpc", // Adjust if your tRPC endpoint is different
			router: appRouter,
			onError({ error, path }) {
				console.error(`tRPC Error on '${path}'`, error);
			},
			createContext() {
				return {
					request: request,
					env: env,
					db: drizzle(env.DB, { logger: true }),
					getCookie(name) {
						const cookieHeader = request.headers.get("Cookie");
						if (!cookieHeader) {
							return null;
						}
						const cookies = cookieHeader.split("; ").reduce(
							(acc, cookieStr) => {
								const [cookieName, cookieValue] = cookieStr.split("=");
								const decryptedData = decrypt(cookieValue, env.CRYPTO_SECRET);
								acc[cookieName] = decryptedData;
								return acc;
							},
							{} as Record<string, string>,
						);
						return cookies[name] || null;
					},
					setCookie(name, value, options) {
						const encryptedData = encrypt(value, env.CRYPTO_SECRET);
						const cookieParts = [`${name}=${encryptedData}`];
						if (options) {
							if (options.httpOnly) {
								cookieParts.push(`HttpOnly`);
							}
							if (options.secure) {
								cookieParts.push(`Secure`);
							}
							if (options.sameSite) {
								cookieParts.push(`SameSite=${options.sameSite}`);
							}
							if (options.maxAge) {
								cookieParts.push(`Max-Age=${options.maxAge}`);
							}
						}
						newHeaders.append("Set-Cookie", cookieParts.join("; "));
					},
				};
			},
		});

		for (const [key, value] of response.headers) {
			newHeaders.set(key, value);
		}

		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers: newHeaders,
		});
	},
} satisfies ExportedHandler<Env>;
