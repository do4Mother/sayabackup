import CryptoJS from "crypto-js";
import z from "zod";
import { protectedProcdure } from "../../middlewares/protected";
import { s3CredentialsDto } from "./dto/s3credentials.dto";

export function decryptS3Credentials(
	data: {
		encrypted: string;
		key: string;
		masking: boolean;
	} = { encrypted: "", key: "", masking: false },
) {
	const decrypted = CryptoJS.AES.decrypt(data.encrypted, data.key);
	const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
	return s3CredentialsDto({ masking: data.masking }).parse(
		JSON.parse(decryptedString),
	);
}

export const decryptS3 = protectedProcdure
	.input(
		z.object({
			credentials: z.string(),
		}),
	)
	.query(async ({ input, ctx }) => {
		return {
			credentials: decryptS3Credentials({
				encrypted: input.credentials,
				key: ctx.user.key,
				masking: true,
			}),
		};
	});
