import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Credentials } from "./credentials";

export function deleteFile(data: { path: string; key: string }) {
  const { client, bucketName } = s3Credentials(data.key);

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: data.path,
  });

  return client.send(command);
}
