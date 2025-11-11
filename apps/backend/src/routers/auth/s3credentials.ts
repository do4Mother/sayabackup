import CryptoJS from "crypto-js";
import z from "zod";
import { protectedProcdure } from "../../middlewares/protected";

export const s3credentials = protectedProcdure
	.input(
		z.object({
			bucket_name: z.string().min(3).max(63),
			region: z.string().min(2).max(100),
			access_key_id: z.string().min(1),
			secret_access_key: z.string().min(1),
			endpoint: z.string().min(1),
		}),
	)
	.mutation(async ({ input, ctx }) => {
		const encrypted = CryptoJS.AES.encrypt(
			JSON.stringify(input),
			ctx.user.key,
		).toString();

		return {
			credentials: encrypted,
		};
	});
