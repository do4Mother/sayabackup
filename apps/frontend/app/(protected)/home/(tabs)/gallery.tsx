import useHeader from "@/components/app/Header";
import HeaderImagePage from "@/components/app/HeaderImagePage";
import ImageList from "@/components/app/ImageList";
import { useSelectedImage } from "@/hooks/use_select_image";
import { Fragment } from "react";
import { match, P } from "ts-pattern";

export default function HomeTabPage() {
  const { Header, onScroll } = useHeader();
  const selectedImages = useSelectedImage((state) => state.selectedImages);

  return (
    <Fragment>
      {match(selectedImages.length)
        .with(P.number.gt(0), () => <HeaderImagePage />)
        .otherwise(() => (
          <Header />
        ))}

      <ImageList onScroll={onScroll} className="pt-16" />
    </Fragment>
  );
}
