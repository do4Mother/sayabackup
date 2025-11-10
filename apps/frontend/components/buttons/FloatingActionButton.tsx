import { Button } from "../ui/button";
import { Text } from "../ui/text";

type FloatingActionButtonProps = {
  onPress?: () => void;
  label?: string;
  icon?: React.ReactNode;
};

export default function FloatingActionButton(props: FloatingActionButtonProps) {
  return (
    <Button
      onPress={props.onPress}
      className="fixed bottom-20 right-4 z-10 drop-shadow-lg"
      variant={"outline"}
      size={"lg"}
    >
      {props.icon && <>{props.icon}</>}
      {props.label && <Text>{props.label}</Text>}
    </Button>
  );
}
