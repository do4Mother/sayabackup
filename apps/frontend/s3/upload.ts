import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Credentials } from "./credentials";

export async function uploadToS3(data: {
  path: string;
  type: string;
  key: string;
}) {
  const { client, bucketName } = s3Credentials(data.key);

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: data.path,
    ContentType: data.type,
  });

  return getSignedUrl(client, command);
}
