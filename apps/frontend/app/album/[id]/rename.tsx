import { AppButton } from "@/components/button/AppButton";
import { TextInputField } from "@/components/form/TextInputField";
import { trpc } from "@/trpc/trpc";
import { toast } from "@backpackapp-io/react-native-toast";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { ScrollView, Text, View } from "react-native";
import z from "zod";

const RenameAlbum = z.object({
	name: z.string().min(1, "Album name is required"),
});

type RenameAlbum = z.infer<typeof RenameAlbum>;

export default function RenameAlbumScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const data = trpc.album.find.useQuery({ id });
	const {
		control,
		handleSubmit,
		formState: { isLoading },
		setError,
	} = useForm<RenameAlbum>({
		defaultValues: data.data ?? { name: "" },
		resolver: zodResolver(RenameAlbum),
	});

	const updateMutation = trpc.album.update.useMutation();
	const trpcUtils = trpc.useUtils();

	const onSubmit = handleSubmit((data) => {
		updateMutation.mutate(
			{ id: id as string, name: data.name },
			{
				onSuccess: () => {
					trpcUtils.album.getWithImage.invalidate();
					trpcUtils.album.find.invalidate({ id: id as string });
					router.back();
					setTimeout(() => {
						toast.success("Album renamed successfully", {});
					});
				},
				onError: (error) => {
					setError("name", { message: error.message });
				},
			},
		);
	});

	return (
		<View className="flex-1 bg-neutral-900 px-4 pt-6">
			<Text className="text-white text-left text-2xl font-bold tracking-tight mb-6">
				Rename Album
			</Text>
			<ScrollView>
				<TextInputField control={control} label="Name" name="name" />
				<View className="h-6" />
				<AppButton
					loading={isLoading || updateMutation.isPending}
					onPress={onSubmit}
					icon={<Ionicons name="pencil" size={20} color="black" />}
				>
					<Text className="font-semibold">Rename Album</Text>
				</AppButton>
			</ScrollView>
		</View>
	);
}
