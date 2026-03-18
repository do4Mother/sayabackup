import { S3_CREDENTIALS_STORAGE_KEY } from "@/lib/constant";
import { S3Client } from "@aws-sdk/client-s3";
import { decrypt } from "@sayabackup/utils";
import z from "zod";

const credentialsObj = z.object({
	bucket_name: z.string().min(3).max(63),
	region: z.string().min(2).max(100),
	access_key_id: z.string().min(1),
	secret_access_key: z.string().min(1),
	endpoint: z.string().min(1),
});

export function s3CredentialsStorageKey(orgId?: string) {
	return orgId
		? `${S3_CREDENTIALS_STORAGE_KEY}_${orgId}`
		: S3_CREDENTIALS_STORAGE_KEY;
}

export function s3Credentials(
	key: string,
	orgKey?: string,
	orgId?: string,
) {
	if (typeof window === "undefined") {
		throw new Error("s3Credentials should only be used on the client side");
	}

	const storageKey = s3CredentialsStorageKey(orgId);
	const encrypted = localStorage.getItem(storageKey);
	if (!encrypted) {
		throw new Error("S3 credentials not found in localStorage");
	}

	let decodedValue: string;
	if (orgId && orgKey) {
		try {
			decodedValue = decrypt(encrypted, orgKey);
		} catch {
			// Fallback to user key if org key fails
			decodedValue = decrypt(encrypted, key);
		}
	} else {
		decodedValue = decrypt(encrypted, key);
	}

	const parsed = credentialsObj.safeParse(JSON.parse(decodedValue));
	if (!parsed.success) {
		throw new Error("Invalid S3 credentials format");
	}

	const client = new S3Client({
		endpoint: parsed.data.endpoint.includes("https")
			? parsed.data.endpoint
			: `https://${parsed.data.endpoint}`,
		region: parsed.data.region,
		credentials: {
			accessKeyId: parsed.data.access_key_id,
			secretAccessKey: parsed.data.secret_access_key,
		},
	});

	return { client, bucketName: parsed.data.bucket_name };
}
