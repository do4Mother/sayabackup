import Logo from "@/assets/images/sayabackup.png";
import { Text } from "@/components/ui/text";
import { cn, tw } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack } from "expo-router";
import {
  TabList,
  Tabs,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from "expo-router/ui";
import React from "react";
import { Pressable, View } from "react-native";

export default function HomePageLayout() {
  const tabMenu = tw`flex-col items-center w-fit flex-1 gap-0.5 md:gap-4 p-4 hover:bg-blue-50 opacity-50 md:flex-row md:flex-none md:w-full md:justify-normal md:rounded-lg`;
  const tabText = tw`text-sm hidden md:block`;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs className="flex-col md:flex-row-reverse bg-background">
        <View className="flex-1 md:px-4">
          <TabSlot style={{ flex: 1 }} />
        </View>
        <TabList className="flex-row md:flex-col p-0 md:p-4 justify-normal shadow bg-background md:h-screen md:shadow-none md:w-40 lg:w-64">
          <Image
            source={Logo}
            style={{ width: 128, height: 32 }}
            className="mb-4 hidden md:block"
          />
          <TabTrigger
            name="gallery"
            href="/(protected)/home/(tabs)/gallery"
            className={tabMenu}
            asChild
          >
            <TabButton>
              <Ionicons name="images" size={22} />
              <Text className={tabText}>Gallery</Text>
            </TabButton>
          </TabTrigger>
          <TabTrigger
            name="albums"
            href="/(protected)/home/(tabs)/albums"
            className={tabMenu}
            asChild
          >
            <TabButton>
              <Ionicons name="albums" size={22} />
              <Text className={tabText}>Albums</Text>
            </TabButton>
          </TabTrigger>
          <TabTrigger
            name="upload"
            href="/(protected)/home/(tabs)/upload"
            className={tabMenu}
            asChild
          >
            <TabButton>
              <Ionicons name="cloud-upload" size={22} />
              <Text className={tabText}>Upload</Text>
            </TabButton>
          </TabTrigger>
          <TabTrigger
            name="setting"
            href="/(protected)/home/(tabs)/setting"
            className={tabMenu}
            asChild
          >
            <TabButton>
              <Ionicons name="settings" size={22} />
              <Text className={tabText}>Setting</Text>
            </TabButton>
          </TabTrigger>
        </TabList>
      </Tabs>
    </>
  );
}

type TabButtonProps = Omit<TabTriggerSlotProps, "children"> & {
  children: ((isFocused?: boolean) => React.ReactNode) | React.ReactNode;
};

function TabButton({ children, ...props }: TabButtonProps) {
  return (
    <Pressable
      {...props}
      className={cn(
        props.className,
        props.isFocused &&
          "after:content-[''] after:absolute after:bottom-2 after:left-1/2 after:-translate-x-1/2 after:size-1.5 after:rounded-full after:bg-blue-600 opacity-100 md:after:hidden md:bg-blue-100",
      )}
    >
      {typeof children === "function" ? children(props.isFocused) : children}
    </Pressable>
  );
}
