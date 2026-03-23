import { useAlert } from "@/components/alert/AlertContext";
import { Header } from "@/components/app/Header";
import { AppButton } from "@/components/button/AppButton";
import { useSessions } from "@/hooks/use-sessions";
import { queryClient, trpc } from "@/trpc/trpc";
import { toast } from "@backpackapp-io/react-native-toast";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function OrganizationScreen() {
	const insets = useSafeAreaInsets();
	const router = useRouter();

	const orgQuery = trpc.org.list.useQuery();
	const orgs = orgQuery.data ?? [];
	const personalOrgQuery = trpc.org.getPersonalOrg.useQuery();

	const regularOrgs = orgs.filter((o) => !o.is_personal);
	const sharedSpaces = orgs.filter((o) => o.is_personal);

	const activeOrgId = useSessions((s) => s.activeOrgId);
	const setActiveOrg = useSessions((s) => s.setActiveOrg);

	const isPersonalActive =
		activeOrgId != null && activeOrgId === personalOrgQuery.data?.id;

	const handleSelectOrg = (orgId: string, orgName: string) => {
		setActiveOrg(orgId, orgName);
		queryClient.invalidateQueries();
		router.back();
	};

	const handleSelectPersonal = () => {
		if (personalOrgQuery.data) {
			setActiveOrg(personalOrgQuery.data.id, personalOrgQuery.data.name);
		}
		queryClient.invalidateQueries();
		router.back();
	};

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

	return (
		<View className="flex-1 bg-neutral-950" style={{ paddingTop: insets.top }}>
			<Header title="Organization" />

			<View className="px-5 mt-4">
				{/* Personal option */}
				<Pressable
					onPress={handleSelectPersonal}
					className="flex-row items-center py-3.5 border-b border-neutral-900"
				>
					<View className="w-10 h-10 rounded-full bg-amber-400 items-center justify-center mr-3">
						<Ionicons name="person" size={18} color="#171717" />
					</View>
					<View className="flex-1">
						<Text className="text-white text-sm font-medium">Personal</Text>
						<Text className="text-neutral-500 text-xs mt-0.5">
							Your personal galleries and albums
						</Text>
					</View>
					<View className="flex-row items-center gap-2">
						<Pressable
							onPress={(e) => {
								e.stopPropagation();
								router.push("/organization/invite");
							}}
							className="w-8 h-8 rounded-full items-center justify-center active:bg-neutral-800"
						>
							<Ionicons name="person-add" size={14} color="#fbbf24" />
						</Pressable>
						{isPersonalActive && (
							<Ionicons name="checkmark-circle" size={20} color="#fbbf24" />
						)}
					</View>
				</Pressable>

				{/* Members section for personal space */}
				{isPersonalActive && personalOrgQuery.data && (
					<View className="mt-6">
						<MemberList
							organizationId={personalOrgQuery.data.id}
							isOwner={true}
						/>
					</View>
				)}

				{/* Regular organizations */}
				{regularOrgs.length > 0 && (
					<Text className="text-neutral-500 text-xs font-semibold tracking-wider uppercase mt-6 mb-3">
						Organizations
					</Text>
				)}
				{regularOrgs.map((org) => (
					<Pressable
						key={org.id}
						onPress={() => handleSelectOrg(org.id, org.name)}
						className="flex-row items-center py-3.5 border-b border-neutral-900"
					>
						<View className="w-10 h-10 rounded-full bg-neutral-800 items-center justify-center mr-3">
							<Ionicons name="people" size={18} color="#fbbf24" />
						</View>
						<View className="flex-1">
							<Text className="text-white text-sm font-medium">
								{org.name}
							</Text>
							<Text className="text-neutral-500 text-xs capitalize mt-0.5">
								{org.role}
							</Text>
						</View>
						<View className="flex-row items-center gap-2">
							{org.role === "owner" && (
								<Pressable
									onPress={(e) => {
										e.stopPropagation();
										router.push("/organization/invite");
									}}
									className="w-8 h-8 rounded-full items-center justify-center active:bg-neutral-800"
								>
									<Ionicons name="person-add" size={14} color="#fbbf24" />
								</Pressable>
							)}
							{activeOrgId === org.id && (
								<Ionicons name="checkmark-circle" size={20} color="#fbbf24" />
							)}
						</View>
					</Pressable>
				))}

				{/* Shared Spaces (other users' personal spaces) */}
				{sharedSpaces.length > 0 && (
					<Text className="text-neutral-500 text-xs font-semibold tracking-wider uppercase mt-6 mb-3">
						Shared Spaces
					</Text>
				)}
				{sharedSpaces.map((org) => (
					<Pressable
						key={org.id}
						onPress={() => handleSelectOrg(org.id, org.name)}
						className="flex-row items-center py-3.5 border-b border-neutral-900"
					>
						<View className="w-10 h-10 rounded-full bg-neutral-800 items-center justify-center mr-3">
							<Ionicons name="person" size={18} color="#fbbf24" />
						</View>
						<View className="flex-1">
							<Text className="text-white text-sm font-medium">
								{org.name}
							</Text>
							<Text className="text-neutral-500 text-xs capitalize mt-0.5">
								{org.role}
							</Text>
						</View>
						{activeOrgId === org.id && (
							<Ionicons name="checkmark-circle" size={20} color="#fbbf24" />
						)}
					</Pressable>
				))}

				{/* Members section for active org */}
				{activeOrgId &&
					!isPersonalActive &&
					orgs.some((o) => o.id === activeOrgId) && (
						<View className="mt-6">
							<MemberList
								organizationId={activeOrgId}
								isOwner={
									orgs.find((o) => o.id === activeOrgId)?.role === "owner"
								}
							/>
						</View>
					)}
			</View>

			{/* Create Organization button */}
			<View className="px-5 mt-8">
				<AppButton
					label="Create Organization"
					icon={<Ionicons name="add" size={20} color="black" />}
					onPress={() => router.push("/organization/create")}
				/>
			</View>
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
			<View className="items-center justify-center py-4">
				<ActivityIndicator />
			</View>
		);
	}

	return (
		<View>
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
