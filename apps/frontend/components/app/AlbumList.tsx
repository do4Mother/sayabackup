import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/trpc";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  View,
} from "react-native";
import { match, P } from "ts-pattern";
import { Button } from "../ui/button";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { Text } from "../ui/text";
import CreateAlbumDialog from "./CreateAlbumDialog";

type AlbumListProps = {
  selectMode?: "none" | "single";
  value?: string | null;
  onChange?: (albumId: string | null) => void;
  className?: string;
  itemClassName?: string;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

export default function AlbumList(props: AlbumListProps) {
  const { selectMode = "none" } = props;
  const [selectedId, setSelectedId] = useState<string | null | undefined>(
    props.value,
  );
  const albums = trpc.album.get.useQuery();
  const router = useRouter();

  return match(albums)
    .with(
      { isPending: false, data: P.when((v) => (v?.length ?? 0) > 0) },
      () => (
        <FlatList
          data={albums.data}
          className={cn("bg-background", props.className)}
          onScroll={props.onScroll}
          renderItem={({ item }) =>
            match(selectMode)
              .with("single", () => (
                <Item
                  item={item}
                  className={props.itemClassName}
                  selected={selectedId === item.id}
                  onPress={() => {
                    const value = match(selectedId)
                      .with(item.id, () => null)
                      .otherwise(() => item.id);

                    props.onChange?.(value);
                    setSelectedId(value);
                  }}
                />
              ))
              .otherwise(() => (
                <Item
                  item={item}
                  className={props.itemClassName}
                  onPress={() => {
                    router.push({
                      pathname: "/(protected)/home/(tabs)/albums",
                      params: {
                        id: item.id,
                      },
                    });
                  }}
                />
              ))
          }
        />
      ),
    )
    .with({ isError: true }, () => (
      <View className="flex-1 items-center justify-center p-4 bg-background">
        <Text>{albums.error?.message}</Text>
      </View>
    ))
    .with(
      { isPending: false, data: P.when((v) => (v?.length ?? 0) === 0) },
      () => <NoData />,
    )
    .otherwise(() => (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    ));
}

function Item(data: {
  selected?: boolean;
  onPress?: () => void;
  item: { id: string; name: string };
  className?: string;
}) {
  return (
    <Pressable onPress={data.onPress}>
      <View
        className={cn(
          "p-4 border-b border-border bg-card flex-row items-center gap-4",
          data.className,
        )}
      >
        <Ionicons name="albums" size={24} className="text-blue-500 mt-px" />
        <Text className="text-lg font-medium flex-1">{data.item.name}</Text>
        {data.selected && (
          <Ionicons
            name="checkmark-circle"
            size={20}
            className="text-[#34D399] mt-1.5"
          />
        )}
      </View>
    </Pressable>
  );
}

function NoData() {
  const [open, setOpen] = useState(false);

  return (
    <View className="flex-1 items-center justify-center px-4 gap-4 bg-background">
      <Text className="text-center font-medium text-lg">
        Start organizing your memories into beautiful albums!
      </Text>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Ionicons name="add-circle-outline" size={20} color="white" />
            <Text>Create Album</Text>
          </Button>
        </DialogTrigger>

        <CreateAlbumDialog onOpenChange={setOpen} />
      </Dialog>
    </View>
  );
}
