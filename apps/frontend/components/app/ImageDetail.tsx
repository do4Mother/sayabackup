import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/trpc";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Pressable, View } from "react-native";
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
  albumId?: string;
};

type ImageItem = AppRouterOutput["gallery"]["get"][number];

export default function ImageDetail(props: ImageDetailProps) {
  const dimensions = Dimensions.get("window");
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const params = useLocalSearchParams();
  const images = trpc.gallery.get.useQuery({
    albumId: props.albumId,
  });
  const [data, setData] = useState<ImageItem[] | null>(null);
  const image: ImageItem | undefined = data?.[activeIndex];

  useEffect(() => {
    if (!images.data) return;

    setData(images.data);
  }, [images.data]);

  useEffect(() => {
    const initialIndex =
      images.data?.findIndex((item) => item.id === params.id) ?? 0;
    flatListRef.current?.scrollToOffset({
      offset: initialIndex * dimensions.width,
    });
  }, [data]);

  const onUpdateData = (id: string, updatedImage: Partial<ImageItem>) => {
    setData(
      (prevData) =>
        prevData?.map((item) =>
          item.id === id ? { ...item, ...updatedImage } : item,
        ) ?? [],
    );
  };

  return (
    <>
      <FlatList<ImageItem>
        ref={flatListRef}
        data={data}
        className="bg-background"
        contentContainerClassName="gap-4 items-center"
        snapToAlignment="center"
        snapToInterval={dimensions.width}
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
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
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
      <View className="h-[55px] bg-background border-t border-slate-200 flex-row px-4 py-2 gap-x-4 justify-around">
        <View className="items-center justify-center">
          <AntDesign name="cloud-download" size={20} />
          <Text className="text-xs font-semibold">Download</Text>
        </View>
        <AddToAlbum
          item={image}
          onUpdate={(albumId) => {
            onUpdateData(image?.id ?? "", {
              album_id: albumId,
            });
          }}
        />
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
  onUpdate?: (albumId: string | null) => void;
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
          props.onUpdate?.(albumId);
          clientUtils.gallery.get.invalidate();
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
