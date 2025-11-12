import z from "zod";
import { protectedProcdure } from "../../middlewares/protected";
import { encrypt } from "../../utils/crypto";

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
		const encrypted = encrypt(JSON.stringify(input), ctx.user.key);

		return {
			credentials: encrypted,
		};
	});
