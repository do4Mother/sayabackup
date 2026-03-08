import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";

type S3FormValues = {
	endpoint: string;
	region: string;
	bucket_name: string;
	access_key_id: string;
	secret_access_key: string;
};

export async function testS3Connection(values: S3FormValues) {
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

	/**
	 * Simulate create file, download, and delete operations to test the connection and permissions.
	 * We will create a temporary file, upload it, download it, and then delete it.
	 */

	const testFileName = "s3-connection-test-file.txt";
	const testFileContent = "This is a test file for S3 connection.";
	const bucketName = values.bucket_name;

	await client.send(
		new PutObjectCommand({
			Bucket: bucketName,
			Key: testFileName,
			Body: testFileContent,
		}),
	);

	await client.send(
		new GetObjectCommand({
			Bucket: bucketName,
			Key: testFileName,
		}),
	);

	await client.send(
		new DeleteObjectCommand({
			Bucket: bucketName,
			Key: testFileName,
		}),
	);
}
