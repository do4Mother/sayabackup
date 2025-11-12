import Heading from "@/components/app/Heading";
import FloatingActionButton from "@/components/buttons/FloatingActionButton";
import { S3_CREDENTIALS_STORAGE_KEY } from "@/lib/constant";
import { trpc } from "@/trpc/trpc";
import { FontAwesome6 } from "@expo/vector-icons";
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
  const images = trpc.gallery.get.useQuery({
    credentials: localStorage.getItem(S3_CREDENTIALS_STORAGE_KEY) || "",
  });

  const imageWidth = Dimensions.get("window").width / 4 - 16; // 4 columns with some spacing

  return (
    <View className="bg-background flex-1">
      <FloatingActionButton
        label="Upload"
        icon={<FontAwesome6 name="upload" size={16} />}
      />
      <Heading title="Gallery" />
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
            className="p-4"
            contentContainerClassName="gap-y-4"
            columnWrapperClassName="gap-2"
            renderItem={({ item }) => (
              <Image
                source={{ uri: item.thumbnail_url }}
                className="aspect-square rounded-lg"
                style={{ width: imageWidth }}
              />
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
