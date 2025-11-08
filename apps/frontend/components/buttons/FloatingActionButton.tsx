import React from "react";
import { Pressable, Text } from "react-native";

type FloatingActionButtonProps = {
  onPress?: () => void;
  label?: string;
  icon?: React.ReactNode;
};

export default function FloatingActionButton(props: FloatingActionButtonProps) {
  return (
    <Pressable
      onPress={props.onPress}
      style={{
        position: "fixed",
        bottom: 55 + 20,
        right: 20,
        backgroundColor: "#6200ee",
        borderRadius: 30,
        padding: 15,
        flexDirection: "row",
        alignItems: "center",
        elevation: 5,
        zIndex: 100,
      }}
    >
      {props.icon}
      {props.label && <Text>{props.label}</Text>}
    </Pressable>
  );
}
