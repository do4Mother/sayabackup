import { cn } from "@/lib/utils";
import { Text } from "../ui/text";

type HeadingProps = {
  title: string;
  className?: string;
};

export default function Heading({ title, className }: HeadingProps) {
  return (
    <Text className={cn("text-left p-4 capitalize", className)} variant={"h1"}>
      {title}
    </Text>
  );
}
