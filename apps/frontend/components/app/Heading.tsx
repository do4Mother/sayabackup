import { StyleProp, Text, TextStyle } from "react-native";

type HeadingProps = {
  title: string;
  style?: StyleProp<TextStyle>;
};

export default function Heading({ title, style }: HeadingProps) {
  return (
    <Text style={[{ fontWeight: "bold", fontSize: 24 }, style]}>{title}</Text>
  );
}
