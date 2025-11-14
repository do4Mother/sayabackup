import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { trpc } from "@/trpc/trpc";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, FlatList, View } from "react-native";
import { match } from "ts-pattern";

export default function AlbumTab() {
  const albums = trpc.album.get.useQuery();

  return match([(albums.data?.length ?? 0) > 0, albums.isPending])
    .with([true, false], () => (
      <FlatList
        data={albums.data}
        className="bg-background"
        renderItem={({ item }) => (
          <Link
            href={{ pathname: "/albums/[id]", params: { id: item.id } }}
            asChild
          >
            <View className="p-4 border-b border-border bg-card flex-row items-center gap-4">
              <Ionicons
                name="albums"
                size={24}
                className="text-blue-500 mt-px"
              />
              <Text className="text-lg font-medium">{item.name}</Text>
            </View>
          </Link>
        )}
      />
    ))
    .with([false, false], () => <NoData />)
    .otherwise(() => (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    ));
}

function NoData() {
  const [open, setOpen] = useState(false);
  const createMutation = trpc.album.create.useMutation();
  const { handleSubmit, control } = useForm<{ name: string }>({
    defaultValues: {
      name: "",
    },
  });
  const router = useRouter();

  const onCreateAlbum = (data: { name: string }) => {
    createMutation.mutate(data, {
      onSuccess(album) {
        setOpen(false);
        router.push({ pathname: "/albums/[id]", params: { id: album.id } });
      },
    });
  };
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

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Album</DialogTitle>
            <DialogDescription>
              Give your album a name and start adding your favorite photos
            </DialogDescription>
          </DialogHeader>
          <View>
            <Controller
              control={control}
              rules={{ required: true }}
              name="name"
              render={({ field, fieldState }) => (
                <View className="gap-1">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" {...field} />
                  {fieldState.invalid && (
                    <Text className="text-red-500">This field is required</Text>
                  )}
                </View>
              )}
            />
          </View>
          <DialogFooter className="items-end">
            <Button
              onPress={handleSubmit(onCreateAlbum)}
              disabled={createMutation.isPending}
            >
              <Ionicons name="save-outline" size={20} color="white" />
              <Text className="h-[18px]">Create</Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </View>
  );
}
