import Heading from "@/components/app/Heading";
import ImageList from "@/components/app/ImageList";
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
} from "@/components/ui/alert-dialog";
import { Text } from "@/components/ui/text";
import { useSelectedImage } from "@/hooks/use_select_image";
import { trpc } from "@/trpc/trpc";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

export default function HomeTabPage() {
  const selectedImages = useSelectedImage((state) => state.selectedImages);
  const setSelectedImages = useSelectedImage(
    (state) => state.setSelectedImages,
  );

  return (
    <>
      <Stack.Screen
        options={{
          header: (props) => {
            if (selectedImages.length > 0) {
              return (
                <View className="bg-blue-500 flex-row p-4 items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Pressable onPress={() => setSelectedImages([])}>
                      <Ionicons
                        name="close"
                        size={20}
                        color="white"
                        className="h-5"
                      />
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

            return (
              <View className="bg-background">
                <Heading title={props.route.name} />
              </View>
            );
          },
        }}
      />
      <ImageList />
    </>
  );
}

function DeleteButton() {
  const [open, setOpen] = useState(false);
  const removeMutation = trpc.gallery.remove.useMutation();
  const setSelectedImages = useSelectedImage(
    (state) => state.setSelectedImages,
  );
  const clientUtils = trpc.useUtils();

  const handleDelete = async () => {
    const selectedImages = useSelectedImage.getState().selectedImages;
    await removeMutation.mutateAsync({ ids: selectedImages });
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
            <Text>Are you sure you want to delete selected images?</Text>
          </AlertDialogTitle>
          <AlertDialogDescription>
            <Text>This action cannot be undone.</Text>
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
