import Logo from "@/assets/images/sayabackup.png";
import BackupImage from "@/assets/images/undraw-backup.png";
import GoogleSignInButton from "@/components/buttons/GoogleSignInButton";
import { Image } from "expo-image";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="from-slate-50 to-gray-300 bg-gradient-to-b flex-1 md:max-w-md md:mx-auto">
      <View className="flex-1 backdrop-blur-3xl bg-white/80 justify-center p-4">
        <Image
          source={Logo}
          style={{ width: 210, height: 50, marginHorizontal: "auto" }}
        />
        <Text className="font-semibold text-center">
          Secure your memories without compromise
        </Text>

        <View className="mt-14">
          <Image
            source={BackupImage}
            style={{ width: 300, height: 200, marginHorizontal: "auto" }}
          />
          <Text className="leading-5 mt-4 text-justify">
            SayaBackup syncs photos and videos directly to your own
            S3-compatible storage, ensuring credentials stay on your device
            while we simply manage your media.
          </Text>
        </View>

        <View className="mt-auto">
          <GoogleSignInButton />
        </View>
        <Text className="mt-4 text-center text-xs text-gray-700 px-4">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </View>
  );
}
