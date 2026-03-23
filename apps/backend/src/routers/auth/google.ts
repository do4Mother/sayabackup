import { TRPCError } from "@trpc/server";
import { and, eq, getTableColumns } from "drizzle-orm";
import { createRemoteJWKSet, jwtVerify, SignJWT } from "jose";
import { nanoid } from "nanoid";
import { z } from "zod";
import { user_providers, users } from "../../db/schema";
import { publicProcedure } from "../../middlewares/public";
import { AUTH_COOKIE_NAME, USER_PROVIDERS } from "../../utils/constants";
import { getOrCreatePersonalOrg } from "../../utils/personal-org";

export const google = publicProcedure
	.input(
		z.object({
			code: z.string(),
			state: z.string(), // secret value for CSRF protection
		}),
	)
	.mutation(async ({ input, ctx }) => {
		const secretValue = ctx.getCookie("google_auth_secret");

		if (input.state !== secretValue) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Invalid state value",
			});
		}

		/**
		 * get id_token from google with the authorization code
		 */
		const origin = ctx.request.headers.get("origin") || "http://localhost:8081";
		const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				code: input.code,
				client_id: ctx.env.CLIENT_ID,
				client_secret: ctx.env.CLIENT_SECRET,
				redirect_uri: `${origin}/auth/google`,
				grant_type: "authorization_code",
			}),
		});

		const tokenData = z
			.object({
				id_token: z.string(),
			})
			.parse(await tokenResponse.json());
		const idToken = tokenData.id_token;

		/**
		 * verify the id_token and get the user info from the token payload
		 */
		const jwksURL = "https://www.googleapis.com/oauth2/v3/certs";
		const issuer = "https://accounts.google.com";

		const JWKS = createRemoteJWKSet(new URL(jwksURL));

		const { payload } = await jwtVerify(idToken, JWKS, {
			issuer,
			audience: ctx.env.CLIENT_ID,
		});

		const payloadSub = payload.sub;
		// check expired
		if (
			!payload ||
			!payload.exp ||
			!payloadSub ||
			Date.now() >= payload.exp * 1000
		) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Token expired",
			});
		}

		const payloadDto = z
			.object({
				email: z.email(),
				sub: z.string(),
			})
			.parse(payload);

		let [user] = await ctx.db
			.select(getTableColumns(users))
			.from(users)
			.innerJoin(user_providers, eq(users.id, user_providers.user_id))
			.where(
				and(
					eq(user_providers.provider, USER_PROVIDERS.GOOGLE),
					eq(user_providers.provider_user_id, payloadDto.sub),
				),
			);

		if (!user) {
			const [newUser] = await ctx.db
				.insert(users)
				.values({
					email: payloadDto.email,
					key: nanoid(),
				})
				.returning();

			await ctx.db.insert(user_providers).values({
				user_id: newUser.id,
				provider: USER_PROVIDERS.GOOGLE,
				provider_user_id: payloadDto.sub,
			});

			user = newUser;

			// Auto-create personal organization for new users
			await getOrCreatePersonalOrg(ctx.db, {
				id: newUser.id,
				email: newUser.email,
			});
		}

		const secret = new TextEncoder().encode(ctx.env.JWT_SECRET);
		const token = await new SignJWT(user)
			.setProtectedHeader({ alg: "HS256" })
			.setExpirationTime("7d")
			.sign(secret);

		ctx.setCookie(AUTH_COOKIE_NAME, token, {
			httpOnly: true,
			sameSite: "Lax",
			maxAge: 7 * 24 * 60 * 60, // 7 days
		});
	});
