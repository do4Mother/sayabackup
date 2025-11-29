import { useSelectedImage } from "@/hooks/use_select_image";
import { deleteFile } from "@/s3/delete_file";
import { trpc } from "@/trpc/trpc";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, View } from "react-native";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Text } from "../ui/text";

const HeaderImagePage = () => {
  const selectedImages = useSelectedImage((state) => state.selectedImages);
  const setSelectedImages = useSelectedImage(
    (state) => state.setSelectedImages,
  );
  if (selectedImages.length > 0) {
    return (
      <View className="bg-blue-500 flex-row px-4 h-14 items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Pressable onPress={() => setSelectedImages([])}>
            <Ionicons name="close" size={20} color="white" className="mt-0.5" />
          </Pressable>
          <Text className="text-white font-medium text-lg h-7">
            {selectedImages.length} Selected
          </Text>
        </View>
        <View>
          <DeleteButton />
        </View>
      </View>
    );
  }

  return undefined;
};

function DeleteButton() {
  const [open, setOpen] = useState(false);
  const clientUtils = trpc.useUtils();
  const key = clientUtils.auth.me.getData()?.user.key ?? "";
  const setSelectedImages = useSelectedImage(
    (state) => state.setSelectedImages,
  );
  const removeMutation = trpc.gallery.remove.useMutation();

  const handleDelete = async () => {
    const selectedImages = useSelectedImage.getState().selectedImages;
    for await (const image of selectedImages) {
      await deleteFile({ path: image.file_path, key });
      deleteFile({ path: image.thumbnail_path, key });
      await removeMutation.mutateAsync({ ids: [image.id] });
    }
    setSelectedImages([]);
    setOpen(false);
    await clientUtils.gallery.get.invalidate();
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Pressable>
          <Ionicons
            name="trash-outline"
            size={20}
            color="white"
            className="h-5"
          />
        </Pressable>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete selected images?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <Text>Cancel</Text>
          </AlertDialogCancel>
          <AlertDialogAction
            onPress={handleDelete}
            disabled={removeMutation.isPending}
          >
            <Text>Delete</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

HeaderImagePage.displayName = "Header Image Page";

export default HeaderImagePage;
