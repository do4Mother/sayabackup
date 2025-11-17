import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Image } from "react-native";

export default function ImageScalable(props: { source: { uri: string } }) {
  const dimensions = Dimensions.get("window");
  const [isLoading, setIsLoading] = useState(true);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    Image.getSize(
      props.source.uri,
      (width, height) => {
        const maxWidth = dimensions.width;
        const maxHeight = dimensions.height;

        let finalWidth = maxWidth;
        let finalHeight = (height * maxWidth) / width;

        if (finalHeight > maxHeight) {
          finalHeight = maxHeight;
          finalWidth = (width * maxHeight) / height;
        }

        setImageDimensions({ width: finalWidth, height: finalHeight });
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
      },
    );
  }, []);

  return !isLoading ? (
    <Image
      source={props.source}
      style={{ width: imageDimensions?.width, height: imageDimensions?.height }}
    />
  ) : (
    <ActivityIndicator />
  );
}
