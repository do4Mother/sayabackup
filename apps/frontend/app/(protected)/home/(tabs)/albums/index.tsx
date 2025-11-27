import AlbumList from "@/components/app/AlbumList";
import CreateAlbumDialog from "@/components/app/CreateAlbumDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/trpc/trpc";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useState } from "react";

export default function AlbumTab() {
  const [open, setOpen] = useState(false);
  const albums = trpc.album.get.useQuery(void 0, { enabled: false }); // just for listen data changes

  return (
    <>
      <Stack.Screen
        options={{
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
      <AlbumList />
    </>
  );
}
