import AlbumList from "@/components/app/AlbumList";
import CreateAlbumDialog from "@/components/app/CreateAlbumDialog";
import Header from "@/components/app/Header";
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
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
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
import { Fragment, useState } from "react";
import { View } from "react-native";

export default function AlbumTab() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  if (id) {
    return <AlbumDetailScreen />;
  }

  return <ListOfAlbums />;
}

function ListOfAlbums() {
  const [open, setOpen] = useState(false);
  const albums = trpc.album.get.useQuery(void 0, { enabled: false }); // just for listen data changes

  return (
    <Fragment>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Albums",
          headerRight: () =>
            (albums.data?.length ?? 0) > 0 ? (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant={"ghost"} size={"icon"} className="mr-4">
                    <Ionicons name="add" size={22} />
                  </Button>
                </DialogTrigger>

                <CreateAlbumDialog onOpenChange={setOpen} />
              </Dialog>
            ) : undefined,
        }}
      />
      <Header
        title="Albums"
        action={
          albums.data &&
          albums.data.length > 0 && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant={"ghost"} size={"icon"}>
                  <Ionicons name="add" size={22} />
                </Button>
              </DialogTrigger>

              <CreateAlbumDialog onOpenChange={setOpen} />
            </Dialog>
          )
        }
      />
      <AlbumList />
    </Fragment>
  );
}

function AlbumDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
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
      <Header
        title={album.data?.name ?? "Album"}
        action={
          <DropdownMenu>
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
        }
      />
      <ImageList albumId={id} />
    </>
  );
}
