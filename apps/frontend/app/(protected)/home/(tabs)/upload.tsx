import Heading from "@/components/app/Heading";
import FloatingActionButton from "@/components/buttons/FloatingActionButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { FlatList, Image, ScrollView, Text, View } from "react-native";

export default function UploadTabpage() {
  return (
    <View className="bg-background flex-1">
      <FloatingActionButton
        label="Upload"
        icon={<FontAwesome6 name="upload" size={16} />}
      />

      <ScrollView>
        <Heading title="Upload" />
        <FlatList
          data={Array.from({ length: 200 }).map((_, i) => ({
            id: i,
          }))}
          contentContainerClassName="gap-4 px-4 mt-4"
          renderItem={(item) => (
            <Card className="gap-4 flex-row px-4">
              <Image
                source={{
                  uri: `https://picsum.photos/id/${item.index}/200/200`,
                }}
                className="size-20 rounded-md"
              />
              <View className="flex-1">
                <CardHeader className="px-0 flex-1">
                  <CardTitle className="leading-5">
                    Item #{item.item.id + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 mt-2">
                  <Progress value={50} className="my-0" />
                  <Text className="mt-1">50% (37MB of 74MB)</Text>
                </CardContent>
              </View>
            </Card>
          )}
        />
      </ScrollView>
    </View>
  );
}
