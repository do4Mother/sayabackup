import { getFile } from "@/s3/get_file";
import { trpc } from "@/trpc/trpc";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { ComponentProps } from "react";

export default function CustomImage(props: ComponentProps<typeof Image>) {
  if (
    !props.source ||
    typeof props.source !== "object" ||
    !("uri" in props.source)
  ) {
    throw new Error("Invalid image source");
  }

  const clientUtils = trpc.useUtils();
  const key = clientUtils.auth.me.getData()?.user.key ?? "";

  const source = props.source;

  const image = useQuery({
    queryKey: ["custom-image", props.source],
    queryFn: async () => {
      const response = await getFile({
        path: source.uri ?? "",
        key: key,
      });

      return response;
    },
  });

  return <Image {...props} source={{ uri: image.data?.url }} loading="lazy" />;
}
