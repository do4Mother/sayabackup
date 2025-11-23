import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { useAlert } from "@/hooks/use_alert";
import { S3_CREDENTIALS_STORAGE_KEY } from "@/lib/constant";
import { trpc } from "@/trpc/trpc";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { decrypt, encrypt } from "@sayabackup/utils";
import { useRouter } from "expo-router";
import { isEmpty, omitBy } from "lodash-es";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import z from "zod";

const s3credentialsDto = z.object({
  bucket_name: z.string().min(3).max(63),
  region: z.string().min(2).max(100),
  access_key_id: z.string().min(1),
  secret_access_key: z.string().min(1),
  endpoint: z.string().min(1),
});

type FormData = z.infer<typeof s3credentialsDto>;

export default function SettingTabpage() {
  const user = trpc.auth.me.useQuery();
  const logout = trpc.auth.logout.useMutation();
  const router = useRouter();
  const clientUtils = trpc.useUtils();
  const alert = useAlert((state) => state.showAlert);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const defaultValues = useRef({
    endpoint: "",
    access_key_id: "",
    secret_access_key: "",
    bucket_name: "",
    region: "",
  });
  const [credentials, setCredentials] = useState<FormData>(
    defaultValues.current,
  );

  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(s3credentialsDto),
    defaultValues: defaultValues.current,
    values: credentials,
  });

  useEffect(() => {
    const encrypted = localStorage.getItem(S3_CREDENTIALS_STORAGE_KEY);
    if (user.data && encrypted) {
      const decrypted = decrypt(encrypted, user.data.user.key);
      if (decrypted) {
        const parsed = s3credentialsDto.safeParse(JSON.parse(decrypted));
        if (parsed.success) {
          setCredentials(parsed.data);
        }
      }
    }
  }, [user.data]);

  const onSubmit = (data: FormData) => {
    if (!user.data?.user.key) {
      alert("Error", "User key is missing. Please logout and login again.");
      return;
    }

    localStorage.setItem(
      S3_CREDENTIALS_STORAGE_KEY,
      encrypt(JSON.stringify(data), user.data?.user.key ?? ""),
    );
    setCredentials(data);
    alert("Success", "S3 Credentials saved successfully.");
  };

  const onLogout = () => {
    logout.mutate(void 0, {
      onSuccess() {
        localStorage.clear();
        router.replace("/");
      },
    });
  };

  const onBackup = () => {
    const data = localStorage.getItem(S3_CREDENTIALS_STORAGE_KEY);
    if (!data) {
      alert("Error", "No credentials found to backup.");
      return;
    }

    const blob = new Blob([data], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "s3-credentials.backup";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert("Success", "Credentials backup downloaded successfully.");
  };

  const onRestore = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      alert("Error", "No file selected for restore.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === "string") {
        const decrpyted = decrypt(content, user.data?.user.key ?? "");
        if (!decrpyted) {
          alert("Error", "Failed to decrypt the backup file.");
          return;
        }
        const parsed = s3credentialsDto.safeParse(JSON.parse(decrpyted));
        if (!parsed.success) {
          alert("Error", "Invalid credentials format in backup file.");
          return;
        }
        localStorage.setItem(S3_CREDENTIALS_STORAGE_KEY, content);
        setCredentials(parsed.data);
        clientUtils.gallery.get.invalidate();
        alert("Success", "Credentials restored successfully.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <View className="bg-background flex-1">
      <ScrollView>
        <Card className="mx-4">
          <CardContent className="gap-y-4">
            <Controller
              control={control}
              rules={{ required: true }}
              name="endpoint"
              render={({ field, fieldState }) => (
                <View className="gap-1">
                  <Label htmlFor="endpoint">Endpoint</Label>
                  <Input id="endpoint" {...field} />
                  {fieldState.invalid && (
                    <Text className="text-red-500">This field is required</Text>
                  )}
                </View>
              )}
            />
            <Controller
              control={control}
              rules={{ required: true }}
              name="access_key_id"
              render={({ field, fieldState }) => (
                <View className="gap-1">
                  <Label htmlFor="access_key_id">Access Key ID</Label>
                  <Input id="access_key_id" {...field} />
                  {fieldState.invalid && (
                    <Text className="text-red-500">This field is required</Text>
                  )}
                </View>
              )}
            />
            <Controller
              control={control}
              rules={{ required: true }}
              name="secret_access_key"
              render={({ field, fieldState }) => (
                <View className="gap-1">
                  <Label htmlFor="secret_access_key">Secret Access Key</Label>
                  <Input id="secret_access_key" {...field} />
                  {fieldState.invalid && (
                    <Text className="text-red-500">This field is required</Text>
                  )}
                </View>
              )}
            />
            <Controller
              control={control}
              rules={{ required: true }}
              name="bucket_name"
              render={({ field, fieldState }) => (
                <View className="gap-1">
                  <Label htmlFor="bucket_name">Bucket Name</Label>
                  <Input id="bucket_name" {...field} />
                  {fieldState.invalid && (
                    <Text className="text-red-500">This field is required</Text>
                  )}
                </View>
              )}
            />
            <Controller
              control={control}
              rules={{ required: true }}
              name="region"
              render={({ field, fieldState }) => (
                <View className="gap-1">
                  <Label htmlFor="region">Region</Label>
                  <Input id="region" {...field} />
                  {fieldState.invalid && (
                    <Text className="text-red-500">This field is required</Text>
                  )}
                </View>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button className="mx-auto" onPress={handleSubmit(onSubmit)}>
              <Text>Save Settings</Text>
            </Button>
          </CardFooter>
        </Card>
        <View className="bg-slate-50 rounded-lg p-4 mx-4 mt-4 flex-row gap-2">
          <View className="w-4">
            <FontAwesome6 name="info" size={24} color="gray" />
          </View>
          <Text className="text-sm text-slate-500">
            We <b>do not store</b> your S3 credentials on our servers. All
            settings are stored locally on your device. Make sure to back them
            up if needed, and be cautious when using public Wi-Fi or shared
            devices.
          </Text>
        </View>

        <View className="mx-4 gap-y-4 mt-4 pb-8">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".backup"
            onChange={onRestore}
          />
          <Button
            variant={"outline"}
            className="justify-start"
            onPress={() => fileInputRef.current?.click()}
          >
            <Ionicons name="cloud-download-outline" size={20} />
            <Text>Restore</Text>
          </Button>
          <Button
            variant={"outline"}
            className="justify-start"
            onPress={onBackup}
            disabled={isEmpty(omitBy(credentials, isEmpty))}
          >
            <Ionicons name="cloud-upload-outline" size={20} />
            <Text>Backup</Text>
          </Button>
          <Button
            variant={"destructive"}
            className="justify-start"
            onPress={onLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="white" />
            <Text>Logout</Text>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
