import React from "react";
import { Button, Text, View } from "react-native";

export default function HomePage() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Welcome to the Home Page</Text>
      <Button title="Logout" />
    </View>
  );
}
