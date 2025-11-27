import { Ionicons } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { trpc } from "@/trpc/trpc";
import { Button } from "../ui/button";
import { Text } from "../ui/text";
import { Label } from "../ui/label";

type CreateAlbumDialogProps = {
  onOpenChange?: (open: boolean) => void;
};

export default function CreateAlbumDialog(props: CreateAlbumDialogProps) {
  const createMutation = trpc.album.create.useMutation();
  const { handleSubmit, control } = useForm<{ name: string }>({
    defaultValues: {
      name: "",
    },
  });
  const clientUtils = trpc.useUtils();

  const onCreateAlbum = (data: { name: string }) => {
    createMutation.mutate(data, {
      onSuccess() {
        props.onOpenChange?.(false);
        clientUtils.album.get.invalidate();
      },
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create New Album</DialogTitle>
        <DialogDescription>
          Give your album a name and start adding your favorite photos
        </DialogDescription>
      </DialogHeader>
      <View>
        <Controller
          control={control}
          rules={{ required: true }}
          name="name"
          render={({ field, fieldState }) => (
            <View className="gap-1">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...field}
                onSubmitEditing={handleSubmit(onCreateAlbum)}
              />
              {fieldState.invalid && (
                <Text className="text-red-500">This field is required</Text>
              )}
            </View>
          )}
        />
      </View>
      <DialogFooter className="items-end">
        <Button
          onPress={handleSubmit(onCreateAlbum)}
          disabled={createMutation.isPending}
        >
          <Ionicons name="save-outline" size={20} color="white" />
          <Text className="h-[18px]">Create</Text>
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
