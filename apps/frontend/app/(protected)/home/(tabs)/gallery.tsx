import HeaderImagePage from "@/components/app/HeaderImagePage";
import ImageList from "@/components/app/ImageList";
import { Stack } from "expo-router";

export default function HomeTabPage() {
  return (
    <>
      <Stack.Screen
        options={{
          header: () => (
            <HeaderImagePage
              title="Gallery"
              disableBackButton
              variant="large"
            />
          ),
        }}
      />
      <ImageList />
    </>
  );
}
