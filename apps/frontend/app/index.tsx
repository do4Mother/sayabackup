import { trpc } from "@/trpc/trpc";
import { Pressable, Text, View } from "react-native";

export default function Index() {
  const { data } = trpc.hello.useQuery();

  console.log("data", data);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: 800 }}>SayaBackup</Text>
      <Text style={{ fontSize: 20, textAlign: "center", marginTop: 10 }}>
        Your personal backup solution for photos and videos.
      </Text>

      <Pressable
        style={{
          marginTop: 50,
          paddingHorizontal: 20,
          paddingVertical: 15,
          backgroundColor: "#4285F4",
          borderRadius: 5,
          width: "100%",
        }}
      >
        <Text style={{ color: "#fff" }}>Sign in with Google</Text>
      </Pressable>

      <div>Hello World</div>
    </View>
  );
}
