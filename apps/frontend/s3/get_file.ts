import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { freezeSignedUrl } from "@sayabackup/utils";
import { s3Credentials } from "./credentials";

export async function getFile(data: {
  path: string;
  key: string;
  isDownload?: boolean;
}) {
  const { client, bucketName } = s3Credentials(data.key);

  const response = await freezeSignedUrl({
    url: data.path,
    ttlSeconds: 3600,
    newUrlCallback: async () => {
      const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: data.path,
        ResponseCacheControl: "public, max-age=3600",
        ResponseContentDisposition: data.isDownload
          ? `attachment; filename="${data.path.split("/").pop()}"`
          : undefined,
      });
      return getSignedUrl(client, getCommand, { expiresIn: 3600 });
    },
  });

  return {
    path: data.path,
    url: response,
  };
}
