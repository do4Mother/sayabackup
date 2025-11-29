import { cn } from "@/lib/utils";
import { deleteFile } from "@/s3/delete_file";
import { getFile } from "@/s3/get_file";
import { moveFile } from "@/s3/move_file";
import { trpc } from "@/trpc/trpc";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { debounce } from "lodash-es";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { match, P } from "ts-pattern";
import { AppRouterOutput } from "../../../backend/src/routers/routers";
import CustomImage from "../images/CustomImage";
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
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Text } from "../ui/text";
import AlbumList from "./AlbumList";
import VideoPlayer from "./VideoPlayer";

type ImageDetailProps = {
  imageId: string;
  albumId?: string | null;
};

type ImageItem = AppRouterOutput["gallery"]["get"]["items"][number];

export default function ImageDetail(props: ImageDetailProps) {
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });
  const flatListRef = useRef<FlatList>(null);
  const clientUtils = trpc.useUtils();
  const initialData = clientUtils.gallery.get.getInfiniteData({
    albumId: props.albumId ?? undefined,
    limit: 32,
  });
  const images = trpc.gallery.get.useInfiniteQuery(
    {
      albumId: props.albumId ?? undefined,
      limit: 32,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialData,
    },
  );
  const items = useMemo(() => {
    return images.data.pages.flatMap((page) => page.items);
  }, [images.data.pages]);

  const [image, setImage] = useState<ImageItem | undefined>();
  const index = useMemo(() => {
    const result = match(image)
      .with(
        P.nonNullable,
        (img) => items?.findIndex((v) => v.id === img.id) ?? 0,
      )
      .otherwise(() => 0);
    return result;
  }, [image, items]);
  const onMounted = useRef(false);

  useEffect(() => {
    if (!items || onMounted.current) return;

    /**
     * Scroll to the selected image
     */
    const index = items.findIndex((img) => img.id === props.imageId) ?? -1;
    if (index !== -1 && dimensions.width > 0) {
      if (!flatListRef.current) return;

      flatListRef.current.scrollToOffset({
        offset: index * (dimensions.width + 16),
        animated: false,
      });
      onMounted.current = true;
    }
  }, [items, dimensions.width]);

  useEffect(() => {
    if (!items) return;

    /**
     * Set the current image based on the imageId prop
     */
    const foundImage = items.find((img) => img.id === props.imageId);
    if (foundImage) {
      setImage(foundImage);
    }
  }, [items]);

  const onNext = () => {
    if (!items || !image) return;

    if (index !== -1 && index < items.length - 1) {
      flatListRef.current?.scrollToOffset({
        offset: (index + 1) * (dimensions.width + 16),
        animated: true,
      });
    }
  };

  const onPrev = () => {
    if (!items || !image) return;

    if (index > 0) {
      flatListRef.current?.scrollToOffset({
        offset: (index - 1) * (dimensions.width + 16),
        animated: true,
      });
    }
  };

  return (
    <>
      {match(images)
        .with({ data: P.when((v) => (v?.pages.length ?? 0) > 0) }, () => (
          <>
            <FlatList<ImageItem>
              ref={flatListRef}
              data={items}
              className="bg-background"
              contentContainerClassName="gap-4 items-center"
              snapToAlignment="center"
              decelerationRate={"fast"}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              initialNumToRender={items?.length}
              onScroll={debounce((event) => {
                if (!dimensions.width || !items?.length) return;

                const slideWidth = dimensions.width + 16;
                const nextIndex = Math.round(
                  event.nativeEvent.contentOffset.x / slideWidth,
                );

                if (items[nextIndex] && items[nextIndex]?.id !== image?.id) {
                  setImage(items[nextIndex]);
                }

                // Load more items if near the end
                if (
                  nextIndex >= (items.length ?? 0) - 3 &&
                  images.hasNextPage &&
                  !images.isFetchingNextPage
                ) {
                  images.fetchNextPage();
                }
              }, 100)}
              onLayout={(event) => {
                const { width, height } = event.nativeEvent.layout;
                setDimensions({
                  width,
                  height,
                });
              }}
              renderItem={({ item }) => (
                <View
                  key={item.id}
                  style={{
                    width: dimensions.width,
                    height: dimensions.height,
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {match(item)
                    .with({ mime_type: P.string.includes("image") }, () => (
                      <CustomImage
                        source={{ uri: item.thumbnail_path }}
                        className="w-full flex-1"
                        contentFit="contain"
                        cachePolicy={"memory-disk"}
                      />
                    ))
                    .with({ mime_type: P.string.includes("video") }, () => (
                      <VideoPlayer item={item} />
                    ))
                    .otherwise(() => (
                      <Text>Unsupported media type: {item.mime_type}</Text>
                    ))}
                </View>
              )}
            />

            {index > 0 && (
              <Pressable
                className="absolute top-0 bottom-0 left-0 opacity-20 hover:opacity-40 bg-gradient-to-r from-black to-transparent hidden xl:block"
                onPress={onPrev}
              >
                <View className="w-14 flex items-center justify-center h-full">
                  <Ionicons
                    name="chevron-back"
                    size={24}
                    className="text-white"
                  />
                </View>
              </Pressable>
            )}

            {index < (items?.length ?? 0) - 1 && (
              <Pressable
                className="absolute top-0 bottom-0 right-0 opacity-20 hover:opacity-40 bg-gradient-to-r from-transparent to-black hidden xl:block"
                onPress={onNext}
              >
                <View className="w-14 flex items-center justify-center h-full">
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    className="text-white"
                  />
                </View>
              </Pressable>
            )}
          </>
        ))
        .with({ data: P.when((v) => v.pages.length === 0) }, () => (
          <View className="bg-background flex-1 items-center justify-center">
            <Text className=" text-slate-500">No images found.</Text>
          </View>
        ))
        .otherwise(() => null)}
      <View className="h-[55px] bg-background border-t border-slate-200 flex-row px-4 py-2 gap-x-4 justify-around">
        <DownloadButton item={image} />
        <AddToAlbum item={image} />
        <DeleteButton
          item={image}
          onSuccess={() => {
            setImage(items[index + 1] ?? items[index - 1]);
          }}
        />
      </View>
    </>
  );
}

type AddToAlbumProps = {
  item?: ImageItem;
};
function AddToAlbum(props: AddToAlbumProps) {
  const [open, setOpen] = useState(false);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const updateMutation = trpc.gallery.update.useMutation();
  const clientUtils = trpc.useUtils();
  const key = trpc.useUtils().auth.me.getData()?.user.key ?? "";
  const moveMutation = trpc.gallery.move.useMutation();
  const moveFileMutation = useMutation({
    mutationFn: async (data: { oldPath: string; newPath: string }) => {
      return moveFile({
        oldPath: data.oldPath,
        newPath: data.newPath,
        key: key,
      });
    },
  });
  const isPending =
    updateMutation.isPending ||
    moveMutation.isPending ||
    moveFileMutation.isPending;

  useEffect(() => {
    setSelectedAlbumId(props.item?.album_id ?? null);
  }, [props.item]);

  const onAddAlbum = (albumId: string | null) => {
    if (!props.item) return;

    moveMutation.mutate(
      {
        id: props.item.id,
        albumId: selectedAlbumId,
      },
      {
        onSuccess(data) {
          moveFileMutation.mutate(
            {
              oldPath: data.oldFilePath,
              newPath: data.newFilePath,
            },
            {
              onSuccess() {
                updateMutation.mutate(
                  {
                    id: props.item!.id,
                    albumId: albumId,
                    filePath: data.newFilePath,
                  },
                  {
                    onSuccess() {
                      setOpen(false);
                      setSelectedAlbumId(null);
                      clientUtils.gallery.get.invalidate({ limit: 32 });
                    },
                  },
                );
              },
            },
          );
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Pressable>
          <View
            className={cn(
              "items-center justify-center",
              !props.item && "opacity-50",
            )}
          >
            <Ionicons name="albums-outline" size={20} />
            <Text className={cn("text-xs font-semibold")}>Add to Album</Text>
          </View>
        </Pressable>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Album</DialogTitle>
          <DialogDescription>
            Select an album to add this image to your collection.
          </DialogDescription>
        </DialogHeader>
        <AlbumList
          selectMode="single"
          itemClassName="px-0 py-2"
          value={selectedAlbumId}
          onChange={setSelectedAlbumId}
        />
        <DialogFooter className="items-end">
          <Button
            disabled={isPending}
            onPress={() => onAddAlbum(selectedAlbumId)}
          >
            <Text>Select</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteButton(props: { item?: ImageItem; onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const clientUtils = trpc.useUtils();
  const key = trpc.useUtils().auth.me.getData()?.user.key ?? "";
  const removeMutation = useMutation({
    mutationFn: async (data: { path: string }) => {
      return deleteFile({ path: data.path, key: key });
    },
  });

  const handleDelete = () => {
    if (!props.item) return;

    removeMutation.mutate(
      { path: props.item.file_path },
      {
        onSuccess() {
          clientUtils.gallery.get.invalidate();
          setOpen(false);
          props.onSuccess?.();
        },
      },
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Pressable>
          <View
            className={cn(
              "items-center justify-center",
              !props.item && "opacity-50",
            )}
          >
            <Ionicons name="trash-outline" size={20} />
            <Text className="text-xs font-semibold">Delete</Text>
          </View>
        </Pressable>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this image?
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

function DownloadButton(props: { item?: ImageItem }) {
  const clientUtils = trpc.useUtils();
  const key = clientUtils.auth.me.getData()?.user.key ?? "";

  const getOriginalMutation = useMutation({
    mutationFn: async (data: { path: string }) => {
      const response = await getFile({
        path: data.path,
        key: key,
        isDownload: true,
      });
      return response.url;
    },
  });

  const handleDownload = () => {
    if (!props.item) return;

    getOriginalMutation.mutate(
      { path: props.item.file_path },
      {
        onSuccess(data) {
          console.log("Downloading from URL:", data);
          window.open(data, "_blank");
        },
      },
    );
  };

  return (
    <Pressable onPress={handleDownload}>
      <View
        className={cn(
          "items-center justify-center",
          !props.item && "opacity-50",
        )}
      >
        <AntDesign name="cloud-download" size={20} />
        <Text className="text-xs font-semibold">Download</Text>
      </View>
    </Pressable>
  );
}
