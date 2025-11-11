import { TRPCError } from "@trpc/server";
import CryptoJS from "crypto-js";
import z from "zod";
import { protectedProcdure } from "../../middlewares/protected";
import { s3CredentialsDto } from "./dto/s3credentials.dto";

export const decryptS3 = protectedProcdure
	.input(
		z.object({
			credentials: z.string(),
		}),
	)
	.query(async ({ input, ctx }) => {
		if (!ctx.user?.key) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Decryption key not found for user",
			});
		}

		const decrypted = CryptoJS.AES.decrypt(input.credentials, ctx.user.key);
		const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

		return {
			credentials: s3CredentialsDto.parse(JSON.parse(decryptedString)),
		};
	});
