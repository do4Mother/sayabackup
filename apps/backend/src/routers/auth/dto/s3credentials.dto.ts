import z from "zod";

export const s3CredentialsDto = z.object({
	bucket_name: z.string().min(3).max(63),
	region: z.string().min(2).max(100),
	access_key_id: z.string().min(1),
	secret_access_key: z.string().min(1),
	endpoint: z.string().min(1),
});
