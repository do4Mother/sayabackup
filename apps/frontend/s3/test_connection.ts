import { ListBucketsCommand, S3Client } from "@aws-sdk/client-s3";

type S3FormValues = {
	endpoint: string;
	region: string;
	bucket_name: string;
	access_key_id: string;
	secret_access_key: string;
};

export function testS3Connection(values: S3FormValues) {
	const client = new S3Client({
		endpoint: values.endpoint.includes("https")
			? values.endpoint
			: `https://${values.endpoint}`,
		region: values.region,
		credentials: {
			accessKeyId: values.access_key_id,
			secretAccessKey: values.secret_access_key,
		},
	});

	return client.send(new ListBucketsCommand());
}
