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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Text } from "@/components/ui/text";
import { useUpload } from "@/hooks/use_upload";
import { deleteFile } from "@/s3/delete_file";
import { client, trpc } from "@/trpc/trpc";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { launchImageLibraryAsync } from "expo-image-picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function AlbumDetailPage() {
  const { "#": hash } = useLocalSearchParams<{ "#"?: string }>();
  const search = new URLSearchParams(`#${hash}`);
  const id = search.get("#");
  const router = useRouter();
  const { upload } = useUpload();

  const album = trpc.album.find.useQuery(
    { id: id ?? "" },
    {
      enabled: !!id,
    },
  );
  const clientUtils = trpc.useUtils();
  const key = clientUtils.auth.me.getData()?.user.key ?? "";
  const deleteMutation = useMutation({
    mutationFn: async (input: { withImages: boolean }) => {
      if (input.withImages) {
        const images = await client.gallery.get.query({ albumId: id! });

        for await (const image of images.items) {
          await deleteFile({ path: image.file_path, key: key });
          await client.gallery.remove.mutate({ id: image.id });
          deleteFile({ path: image.thumbnail_path, key: key });
        }
      }

      await client.album.remove.mutate({ id: id! });
    },
  });

  if (!id) {
    return (
      <>
        <Stack.Screen options={{ title: "Album Not Found" }} />
        <View className="bg-background flex-1 items-center justify-center">
          <Text className=" text-slate-500">Couldn&apos;t find album.</Text>
        </View>
      </>
    );
  }

  const onUpload = async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      upload({ images: result.assets, albumId: id });
      router.replace("/(protected)/home/(tabs)/upload");
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: album.data?.name ?? "",
          headerRight: () => (
            <DropdownMenu className="mr-4">
              <DropdownMenuTrigger>
                <Ionicons name="ellipsis-vertical" size={20} />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>
                  <Text onPress={onUpload}>Upload</Text>
                </DropdownMenuLabel>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuLabel>
                      <Text className="text-red-500">Delete Album</Text>
                    </DropdownMenuLabel>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you sure you want to delete this album?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. It will permanently delete
                        the album.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        <Text>Cancel</Text>
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onPress={() =>
                          deleteMutation.mutate(
                            { withImages: true },
                            {
                              onSuccess() {
                                clientUtils.gallery.get.invalidate();
                                clientUtils.album.get.invalidate();

                                if (router.canGoBack()) {
                                  router.back();
                                } else {
                                  router.replace(
                                    "/(protected)/home/(tabs)/albums",
                                  );
                                }
                              },
                            },
                          )
                        }
                        disabled={deleteMutation.isPending}
                      >
                        <Text>Delete With Images</Text>
                      </AlertDialogAction>
                      <AlertDialogAction
                        onPress={() =>
                          deleteMutation.mutate(
                            { withImages: false },
                            {
                              onSuccess() {
                                clientUtils.gallery.get.invalidate();
                                clientUtils.album.get.invalidate();

                                if (router.canGoBack()) {
                                  router.back();
                                } else {
                                  router.replace(
                                    "/(protected)/home/(tabs)/albums",
                                  );
                                }
                              },
                            },
                          )
                        }
                        disabled={deleteMutation.isPending}
                      >
                        <Text>Delete Album</Text>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          ),
        }}
      />
      <ImageList albumId={id} />
    </>
  );
}
