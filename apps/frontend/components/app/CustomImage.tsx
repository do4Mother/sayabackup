import { useSessions } from "@/hooks/use-sessions";
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

	const user = trpc.auth.me.useQuery();
	const key = user.data?.user.key ?? "";

	const activeOrgId = useSessions((s) => s.activeOrgId);
	const orgList = trpc.org.list.useQuery();
	const activeOrg = orgList.data?.find((o) => o.id === activeOrgId);

	const source = props.source;

	const image = useQuery({
		enabled: !!source.uri,
		queryKey: ["custom-image", props.source, activeOrgId],
		queryFn: async () => {
			const response = await getFile({
				path: source.uri ?? "",
				key: key,
				orgKey: activeOrg?.key,
				orgId: activeOrgId ?? undefined,
			});

			return response;
		},
	});

	return <Image {...props} source={{ uri: image.data?.url }} loading="lazy" />;
}
