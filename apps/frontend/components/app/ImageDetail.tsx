import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/trpc";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  View,
} from "react-native";
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
  const [data, setData] = useState<ImageItem[]>([]);
  const image: ImageItem | undefined = data?.[activeIndex];
  const isHaveAlbum = data?.[activeIndex]?.album_id !== null;

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
    setData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, ...updatedImage } : item,
      ),
    );
  };

  return (
    <>
      <FlatList
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
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ImageScalable source={{ uri: item?.thumbnail_url }} />
          </View>
        )}
      />
      <View className="h-[55px] bg-background border-t border-slate-200 flex-row px-4 py-2 gap-x-4 justify-around">
        <View className="items-center justify-center">
          <AntDesign name="cloud-download" size={20} />
          <Text className="text-xs font-semibold">Download</Text>
        </View>
        <AddToAlbum
          disabled={isHaveAlbum}
          galleryId={image?.id ?? ""}
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

function ImageScalable(props: { source: { uri: string } }) {
  const dimensions = Dimensions.get("window");
  const [isLoading, setIsLoading] = useState(true);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    Image.getSize(
      props.source.uri,
      (width, height) => {
        const maxWidth = dimensions.width;
        const maxHeight = dimensions.height;

        let finalWidth = maxWidth;
        let finalHeight = (height * maxWidth) / width;

        if (finalHeight > maxHeight) {
          finalHeight = maxHeight;
          finalWidth = (width * maxHeight) / height;
        }

        setImageDimensions({ width: finalWidth, height: finalHeight });
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
      },
    );
  }, []);

  return !isLoading ? (
    <Image
      source={props.source}
      style={{ width: imageDimensions?.width, height: imageDimensions?.height }}
    />
  ) : (
    <ActivityIndicator />
  );
}

type AddToAlbumProps = {
  galleryId?: string;
  disabled?: boolean;
  onUpdate?: (albumId: string | null) => void;
};
function AddToAlbum(props: AddToAlbumProps) {
  const [open, setOpen] = useState(false);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const updateMutation = trpc.gallery.update.useMutation();

  const onAddAlbum = (albumId: string | null) => {
    if (!albumId || !props.galleryId) return;

    updateMutation.mutate(
      {
        id: props.galleryId,
        albumId: albumId,
      },
      {
        onSuccess() {
          setOpen(false);
          setSelectedAlbumId(null);
          props.onUpdate?.(albumId);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Pressable disabled={props.disabled}>
          <View className="items-center justify-center">
            <Ionicons
              name="albums-outline"
              size={20}
              className={props.disabled ? "text-gray-400" : ""}
            />
            <Text
              className={cn(
                "text-xs font-semibold",
                props.disabled && "text-gray-400",
              )}
            >
              Add to Album
            </Text>
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
            disabled={!selectedAlbumId || updateMutation.isPending}
            onPress={() => onAddAlbum(selectedAlbumId)}
          >
            <Text>Select</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
