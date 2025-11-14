import { trpc } from "@/trpc/trpc";
import { Link } from "expo-router";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Text,
  View,
} from "react-native";
import { match, P } from "ts-pattern";

export default function HomeTabPage() {
  const images = trpc.gallery.get.useQuery();

  const imageWidth = Dimensions.get("window").width / 4 - 8; // 4 columns with some spacing

  return (
    <View className="bg-background flex-1">
      {match([images.isLoading, images.data])
        .with([false, []], () => (
          <View className="flex-1 justify-center items-center">
            <Text>No images found</Text>
          </View>
        ))
        .with([false, P.when((data) => data && data.length > 0)], () => (
          <FlatList
            data={images.data}
            numColumns={4}
            className="py-4 px-1"
            contentContainerClassName="gap-y-4"
            columnWrapperClassName="gap-2"
            renderItem={({ item }) => (
              <Link
                href={{
                  pathname: "/gallery/[id]",
                  params: {
                    id: item.id,
                  },
                }}
                asChild
              >
                <Image
                  source={{ uri: item.thumbnail_url }}
                  className="aspect-square"
                  style={{ width: imageWidth }}
                />
              </Link>
            )}
          />
        ))
        .otherwise(() => (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ))}
    </View>
  );
}
