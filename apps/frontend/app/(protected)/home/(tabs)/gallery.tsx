import Heading from "@/components/app/Heading";
import FloatingActionButton from "@/components/buttons/FloatingActionButton";
import { FontAwesome6 } from "@expo/vector-icons";
import { FlatList, Image, ScrollView, View } from "react-native";

export default function HomeTabPage() {
  return (
    <View className="bg-background">
      <FloatingActionButton
        label="Upload"
        icon={<FontAwesome6 name="upload" size={16} />}
      />
      <ScrollView>
        <Heading title="Gallery" />
        <FlatList
          data={Array.from({ length: 200 }, (_, i) => ({ key: i.toString() }))}
          numColumns={4}
          contentContainerStyle={{
            gap: 8,
            justifyContent: "center",
            alignItems: "center",
          }}
          columnWrapperStyle={{ gap: 4 }}
          renderItem={({ item }) => (
            <Image
              source={{ uri: `https://picsum.photos/id/${item.key}/200/200` }}
              style={{ width: 100, height: 100, borderRadius: 8 }}
            />
          )}
        />
      </ScrollView>
    </View>
  );
}
