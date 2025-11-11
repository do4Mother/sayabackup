import Heading from "@/components/app/Heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { S3_CREDENTIALS_STORAGE_KEY } from "@/lib/constant";
import { trpc } from "@/trpc/trpc";
import { FontAwesome6 } from "@expo/vector-icons";
import { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";

type FormData = {
  endpoint: string;
  access_key_id: string;
  secret_access_key: string;
  bucket_name: string;
  region: string;
};

export default function SettingTabpage() {
  const credentials = trpc.auth.decryptS3.useQuery({
    credentials: localStorage.getItem(S3_CREDENTIALS_STORAGE_KEY) || "",
  });
  const saveCredentials = trpc.auth.s3credentials.useMutation();
  const defaultValues = useRef({
    endpoint: "",
    access_key_id: "",
    secret_access_key: "",
    bucket_name: "",
    region: "",
  });

  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: defaultValues.current,
    values: credentials.data?.credentials,
  });

  const onSubmit = (data: FormData) => {
    saveCredentials.mutate(data, {
      onSuccess(data) {
        alert("Settings saved successfully!");
        localStorage.setItem(S3_CREDENTIALS_STORAGE_KEY, data.credentials);
      },
    });
  };

  return (
    <View className="bg-background flex-1">
      <ScrollView>
        <Heading title="Settings" />
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
      </ScrollView>
    </View>
  );
}
