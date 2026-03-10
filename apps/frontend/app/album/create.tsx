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

const CreateAlbum = z.object({
	name: z.string().min(1, "Album name is required"),
});

type CreateAlbum = z.infer<typeof CreateAlbum>;

export default function CreateAlbumScreen() {
	const {
		control,
		handleSubmit,
		formState: { isLoading },
		setError,
	} = useForm<CreateAlbum>({
		defaultValues: {
			name: "",
		},
		resolver: zodResolver(CreateAlbum),
	});
	const createMutation = trpc.album.create.useMutation();
	const trpcUtils = trpc.useUtils();

	const onSubmit = handleSubmit((data) => {
		createMutation.mutate(data, {
			onSuccess: () => {
				trpcUtils.album.getWithImage.invalidate();
				router.back();
				setTimeout(() => {
					toast.success("Album created successfully", {});
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
				Create Album
			</Text>
			<ScrollView>
				<TextInputField control={control} label="Name" name="name" />
				<View className="h-6" />
				<AppButton
					loading={isLoading}
					onPress={onSubmit}
					icon={<Ionicons name="add" size={20} color="black" />}
				>
					<Text className="font-semibold">Create Album</Text>
				</AppButton>
			</ScrollView>
		</View>
	);
}
