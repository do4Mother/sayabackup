import GoogleSignInButton from "@/components/buttons/GoogleSignInButton";
import { trpc } from "@/trpc/trpc";
import { Text, View } from "react-native";

export default function Index() {
  const { data } = trpc.hello.useQuery();

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
        Your personal backup solution for photos and videos. {data}
      </Text>

      <View style={{ marginTop: 80 }}>
        <GoogleSignInButton />
      </View>
    </View>
  );
}
