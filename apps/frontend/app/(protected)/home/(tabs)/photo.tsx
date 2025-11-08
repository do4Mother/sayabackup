import Heading from "@/components/app/Heading";
import FloatingActionButton from "@/components/buttons/FloatingActionButton";
import { FontAwesome6 } from "@expo/vector-icons";
import React from "react";
import { FlatList, Image, ScrollView, View } from "react-native";

export default function HomeTabPage() {
  return (
    <View style={{ flex: 1, overflowY: "scroll" }}>
      <FloatingActionButton
        icon={<FontAwesome6 name="camera" size={24} color="white" />}
        label="Upload"
      />
      <ScrollView>
        <Heading title="Photos" style={{ padding: 16 }} />
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
