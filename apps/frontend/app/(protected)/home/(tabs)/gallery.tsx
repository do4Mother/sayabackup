import Heading from "@/components/app/Heading";
import FloatingActionButton from "@/components/buttons/FloatingActionButton";
import { FontAwesome6 } from "@expo/vector-icons";
import { Dimensions, FlatList, Image, View } from "react-native";

export default function HomeTabPage() {
  const imageWidth = Dimensions.get("window").width / 4 - 16; // 4 columns with some spacing

  return (
    <View className="bg-background">
      <FloatingActionButton
        label="Upload"
        icon={<FontAwesome6 name="upload" size={16} />}
      />
      <Heading title="Gallery" />
      <FlatList
        data={Array.from({ length: 200 }, (_, i) => ({ key: i.toString() }))}
        numColumns={4}
        contentContainerClassName="items-center gap-y-4 justify-center"
        columnWrapperClassName="gap-2"
        renderItem={({ item }) => (
          <Image
            source={{ uri: `https://picsum.photos/id/${item.key}/200/200` }}
            className="aspect-square rounded-lg"
            style={{ width: imageWidth }}
          />
        )}
      />
    </View>
  );
}
