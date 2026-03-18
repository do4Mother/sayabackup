import { useAlert } from "@/components/alert/AlertContext";
import { Header } from "@/components/app/Header";
import { AppButton } from "@/components/button/AppButton";
import { trpc } from "@/trpc/trpc";
import { toast } from "@backpackapp-io/react-native-toast";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function OrganizationScreen() {
	const insets = useSafeAreaInsets();
	const router = useRouter();

	const orgQuery = trpc.org.get.useQuery();
	const org = orgQuery.data;

	if (orgQuery.isLoading) {
		return (
			<View
				className="flex-1 bg-neutral-950 items-center justify-center"
				style={{ paddingTop: insets.top }}
			>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	if (!org) {
		return (
			<View
				className="flex-1 bg-neutral-950"
				style={{ paddingTop: insets.top }}
			>
				<Header title="Organization" />
				<View className="flex-1 items-center justify-center px-8">
					<View className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 items-center justify-center mb-6">
						<Ionicons name="people" size={32} color="#fbbf24" />
					</View>
					<Text className="text-white text-lg font-bold mb-2">
						No Organization
					</Text>
					<Text className="text-neutral-500 text-sm text-center mb-8">
						Create an organization to share your galleries and albums with other
						members.
					</Text>
					<AppButton
						label="Create Organization"
						icon={<Ionicons name="add" size={20} color="black" />}
						onPress={() => router.push("/organization/create")}
					/>
				</View>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-neutral-950" style={{ paddingTop: insets.top }}>
			<Header
				title={org.name}
				trailing={
					org.role === "owner" ? (
						<Pressable
							onPress={() => router.push("/organization/invite")}
							className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 items-center justify-center"
						>
							<Ionicons name="person-add" size={16} color="#fbbf24" />
						</Pressable>
					) : undefined
				}
			/>
			<MemberList organizationId={org.id} isOwner={org.role === "owner"} />
		</View>
	);
}

function MemberList({
	organizationId,
	isOwner,
}: {
	organizationId: string;
	isOwner: boolean;
}) {
	const { alert } = useAlert();
	const membersQuery = trpc.org.getMembers.useQuery({ organizationId });
	const revokeMutation = trpc.org.revokeMember.useMutation();
	const trpcUtils = trpc.useUtils();

	const handleRevoke = (userId: number, email: string) => {
		alert("Remove Member", `Remove ${email} from the organization?`, [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Remove",
				style: "destructive",
				onPress: () => {
					revokeMutation.mutate(
						{ organizationId, userId },
						{
							onSuccess: () => {
								trpcUtils.org.getMembers.invalidate();
								toast.success("Member removed");
							},
							onError: (error) => {
								toast.error(error.message);
							},
						},
					);
				},
			},
		]);
	};

	if (membersQuery.isLoading) {
		return (
			<View className="flex-1 items-center justify-center">
				<ActivityIndicator />
			</View>
		);
	}

	return (
		<View className="px-5 mt-4">
			<Text className="text-neutral-500 text-xs font-semibold tracking-wider uppercase mb-3">
				Members
			</Text>
			{membersQuery.data?.map((member) => (
				<View
					key={member.id}
					className="flex-row items-center py-3.5 border-b border-neutral-900"
				>
					<View className="w-10 h-10 rounded-full bg-neutral-800 items-center justify-center mr-3">
						<Text className="text-white text-sm font-bold">
							{member.email.charAt(0).toUpperCase()}
						</Text>
					</View>
					<View className="flex-1">
						<Text className="text-white text-sm font-medium">
							{member.email}
						</Text>
						<Text className="text-neutral-500 text-xs capitalize mt-0.5">
							{member.role}
						</Text>
					</View>
					{isOwner && member.role !== "owner" && (
						<Pressable
							onPress={() => handleRevoke(member.id, member.email)}
							className="w-8 h-8 rounded-full items-center justify-center active:bg-neutral-800"
						>
							<Ionicons name="close" size={16} color="#ef4444" />
						</Pressable>
					)}
				</View>
			))}
		</View>
	);
}
