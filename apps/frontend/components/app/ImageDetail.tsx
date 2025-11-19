import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/trpc";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  View,
} from "react-native";
import { match, P } from "ts-pattern";
import { AppRouterOutput } from "../../../backend/src/routers/routers";
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
import ImageScalable from "./ImageScalable";
import VideoPlayer from "./VideoPlayer";

type ImageDetailProps = {
  imageId: string;
  albumId?: string;
};

type ImageItem = AppRouterOutput["gallery"]["get"][number];

export default function ImageDetail(props: ImageDetailProps) {
  const dimensions = Dimensions.get("window");
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const images = trpc.gallery.get.useQuery({
    albumId: props.albumId,
  });
  const image: ImageItem | undefined = images.data?.[activeIndex];
  const onMounted = useRef(false);

  useEffect(() => {
    if (!images.data || onMounted.current) return;

    const initialIndex = images.data?.findIndex(
      (item) => item.id === props.imageId,
    );
    if (initialIndex && initialIndex > 0 && flatListRef.current) {
      flatListRef.current.scrollToOffset({
        offset: initialIndex * dimensions.width,
        animated: false,
      });
    }

    onMounted.current = true;
  }, [images.data]);

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
              onScroll={(event) => {
                const index = Math.round(
                  event.nativeEvent.contentOffset.x / dimensions.width,
                );
                setActiveIndex(index);
              }}
              decelerationRate={"fast"}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
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
                      <ImageScalable source={{ uri: item.thumbnail_url }} />
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
        <View className="items-center justify-center">
          <AntDesign name="cloud-download" size={20} />
          <Text className="text-xs font-semibold">Download</Text>
        </View>
        <AddToAlbum item={image} />
        <View className="items-center justify-center">
          <Ionicons name="trash-outline" size={20} />
          <Text className="text-xs font-semibold">Delete</Text>
        </View>
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
          clientUtils.gallery.get.refetch({
            albumId: selectedAlbumId ?? undefined,
          });
          clientUtils.gallery.get.refetch({});
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Pressable>
          <View className="items-center justify-center">
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
