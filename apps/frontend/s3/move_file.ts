import { CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Credentials } from "./credentials";

export async function moveFile(data: {
  oldPath: string;
  newPath: string;
  key: string;
}) {
  const { oldPath, newPath, key } = data;
  const { client, bucketName } = s3Credentials(key);

  const command = new CopyObjectCommand({
    Bucket: bucketName,
    CopySource: `${bucketName}/${oldPath}`,
    Key: newPath,
  });

  await client.send(command);

  const deleteCommand = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: oldPath,
  });

  await client.send(deleteCommand);
}
