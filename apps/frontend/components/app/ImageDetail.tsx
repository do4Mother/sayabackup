import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/trpc";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { debounce } from "lodash-es";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";
import { match, P } from "ts-pattern";
import { AppRouterOutput } from "../../../backend/src/routers/routers";
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

type ImageItem = AppRouterOutput["gallery"]["get"][number];

export default function ImageDetail(props: ImageDetailProps) {
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });
  const flatListRef = useRef<FlatList>(null);
  const images = trpc.gallery.get.useQuery({
    albumId: props.albumId,
  });
  const [image, setImage] = useState<ImageItem | undefined>();
  const onMounted = useRef(false);

  useEffect(() => {
    if (!images.data || onMounted.current) return;

    const index = images.data.findIndex((img) => img.id === props.imageId);
    if (index !== -1 && dimensions.width > 0) {
      new Promise((resolve) => setTimeout(resolve, 100)).then(() => {
        if (!flatListRef.current) return;
        flatListRef.current.scrollToOffset({
          offset: index * (dimensions.width + 16),
          animated: false,
        });
        setImage(images.data[index]);
        onMounted.current = true;
      });
    }
  }, [images.data, dimensions.width]);

  return (
    <>
      {match(images)
        .with(
          { isPending: false, data: P.when((v) => v && v.length > 0) },
          ({ data }) => (
            <FlatList<ImageItem>
              ref={flatListRef}
              data={data}
              className="bg-background"
              contentContainerClassName="gap-4 items-center"
              snapToAlignment="center"
              decelerationRate={"fast"}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              initialNumToRender={data?.length}
              onScroll={debounce((event) => {
                const index = Math.round(
                  event.nativeEvent.contentOffset.x / dimensions.width,
                );

                setImage(data![index]);
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
                    height: dimensions.height - 110,
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {match(item)
                    .with({ mime_type: P.string.includes("image") }, () => (
                      <Image
                        source={{ uri: item.thumbnail_url }}
                        className="w-full flex-1"
                        contentFit="contain"
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
          ),
        )
        .with(
          { isPending: false, data: P.when((v) => v?.length === 0) },
          () => (
            <View className="bg-background flex-1 items-center justify-center">
              <Text className=" text-slate-500">No images found.</Text>
            </View>
          ),
        )
        .with({ isPending: true, isRefetching: false }, () => (
          <View className="bg-background flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ))
        .otherwise(() => null)}
      <View className="h-[55px] bg-background border-t border-slate-200 flex-row px-4 py-2 gap-x-4 justify-around">
        <DownloadButton item={image} />
        <AddToAlbum item={image} />
        <DeleteButton item={image} />
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

  useEffect(() => {
    setSelectedAlbumId(props.item?.album_id ?? null);
  }, [props.item]);

  const onAddAlbum = (albumId: string | null) => {
    if (!props.item) return;

    updateMutation.mutate(
      {
        id: props.item.id,
        albumId: albumId,
      },
      {
        onSuccess() {
          setOpen(false);
          setSelectedAlbumId(null);
          clientUtils.gallery.get.refetch({});
          const albumId = props.item?.album_id ?? selectedAlbumId;
          if (albumId) {
            clientUtils.gallery.get.refetch({
              albumId: albumId,
            });
          }
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
            disabled={updateMutation.isPending}
            onPress={() => onAddAlbum(selectedAlbumId)}
          >
            <Text>Select</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteButton(props: { item?: ImageItem }) {
  const [open, setOpen] = useState(false);
  const removeMutation = trpc.gallery.remove.useMutation();
  const clientUtils = trpc.useUtils();

  const handleDelete = async () => {
    if (!props.item) return;

    await removeMutation.mutateAsync({ ids: [props.item.id] });
    await clientUtils.gallery.get.invalidate();
    if (props.item.album_id) {
      await clientUtils.gallery.get.invalidate({
        albumId: props.item.album_id,
      });
    }
    setOpen(false);
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
  const getOriginalMutation = trpc.gallery.original.useMutation();

  const handleDownload = () => {
    if (!props.item) return;

    getOriginalMutation.mutate(
      { id: props.item.id, forceDownload: true },
      {
        onSuccess(data) {
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
