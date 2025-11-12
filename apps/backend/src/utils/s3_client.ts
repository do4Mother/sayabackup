import { S3Client } from "@aws-sdk/client-s3";
import { S3CredentialsDto } from "../routers/auth/dto/s3credentials.dto";

export function createS3Client(data: S3CredentialsDto) {
	return new S3Client({
		endpoint: data.endpoint.includes("https")
			? data.endpoint
			: `https://${data.endpoint}`,
		region: data.region,
		credentials: {
			accessKeyId: data.access_key_id,
			secretAccessKey: data.secret_access_key,
		},
	});
}
