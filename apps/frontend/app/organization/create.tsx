import { AppButton } from "@/components/button/AppButton";
import { TextInputField } from "@/components/form/TextInputField";
import { trpc } from "@/trpc/trpc";
import { toast } from "@backpackapp-io/react-native-toast";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { ScrollView, Text, View } from "react-native";
import z from "zod";

const CreateOrg = z.object({
	name: z.string().min(1, "Organization name is required").max(100),
});

type CreateOrg = z.infer<typeof CreateOrg>;

export default function CreateOrganizationScreen() {
	const {
		control,
		handleSubmit,
		formState: { isLoading },
		setError,
	} = useForm<CreateOrg>({
		defaultValues: { name: "" },
		resolver: zodResolver(CreateOrg),
	});
	const createMutation = trpc.org.create.useMutation();
	const trpcUtils = trpc.useUtils();

	const onSubmit = handleSubmit((data) => {
		createMutation.mutate(data, {
			onSuccess: () => {
				trpcUtils.org.get.invalidate();
				router.back();
				setTimeout(() => {
					toast.success("Organization created");
				});
			},
			onError: (error) => {
				setError("name", { message: error.message });
			},
		});
	});

	return (
		<View className="flex-1 bg-neutral-900 px-4 pt-6">
			<Text className="text-white text-left text-2xl font-bold tracking-tight mb-6">
				Create Organization
			</Text>
			<ScrollView>
				<TextInputField
					control={control}
					label="Organization Name"
					name="name"
					placeholder="My Organization"
				/>
				<View className="h-6" />
				<AppButton
					loading={isLoading || createMutation.isPending}
					onPress={onSubmit}
					icon={<Ionicons name="add" size={20} color="black" />}
				>
					<Text className="font-semibold">Create Organization</Text>
				</AppButton>
			</ScrollView>
		</View>
	);
}
