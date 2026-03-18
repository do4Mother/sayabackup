import { useAlert } from "@/components/alert/AlertContext";
import { AppButton } from "@/components/button/AppButton";
import { TextInputField } from "@/components/form/TextInputField";
import { useSessions } from "@/hooks/use-sessions";
import { trpc } from "@/trpc/trpc";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { Platform, ScrollView, Text, View } from "react-native";
import z from "zod";

const InviteForm = z.object({
	email: z.string().email("Please enter a valid email"),
});

type InviteForm = z.infer<typeof InviteForm>;

export default function InviteScreen() {
	const { alert } = useAlert();
	const activeOrgId = useSessions((s) => s.activeOrgId);
	const inviteMutation = trpc.org.invite.useMutation();

	const {
		control,
		handleSubmit,
		formState: { isLoading },
		setError,
	} = useForm<InviteForm>({
		defaultValues: { email: "" },
		resolver: zodResolver(InviteForm),
	});

	const onSubmit = handleSubmit((data) => {
		if (!activeOrgId) return;
		inviteMutation.mutate(
			{ organizationId: activeOrgId, email: data.email },
			{
				onSuccess: ({ token }) => {
					const origin =
						Platform.OS === "web"
							? window.location.origin
							: "";
					const inviteUrl = `${origin}/invite/${token}`;
					router.back();
					setTimeout(() => {
						alert("Invitation Link", inviteUrl, [
							{
								text: "Copy Link",
								onPress: () => {
									Clipboard.setStringAsync(inviteUrl);
								},
							},
							{ text: "Done", style: "cancel" },
						]);
					});
				},
				onError: (error) => {
					setError("email", { message: error.message });
				},
			},
		);
	});

	return (
		<View className="flex-1 bg-neutral-900 px-4 pt-6">
			<Text className="text-white text-left text-2xl font-bold tracking-tight mb-6">
				Invite Member
			</Text>
			<ScrollView>
				<TextInputField
					control={control}
					label="Email Address"
					name="email"
					placeholder="member@example.com"
					keyboardType="email-address"
				/>
				<View className="h-6" />
				<AppButton
					loading={isLoading || inviteMutation.isPending}
					onPress={onSubmit}
					icon={
						<Ionicons name="send" size={18} color="black" />
					}
				>
					<Text className="font-semibold">Generate Invite Link</Text>
				</AppButton>
			</ScrollView>
		</View>
	);
}
