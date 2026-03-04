import { Header } from "@/components/app/Header";
import HeaderImagePage from "@/components/app/HeaderImagePage";
import ImageList from "@/components/app/ImageList";
import { ScrollListener } from "@/components/app/ScrollListener";
import { useSelectedImage } from "@/hooks/use_select_image";
import { match, P } from "ts-pattern";

export default function HomeTabPage() {
  const selectedImages = useSelectedImage((state) => state.selectedImages);

  return (
    <ScrollListener>
      {(setScrollY) => (
        <>
          {match(selectedImages.length)
            .with(P.number.gt(0), () => <HeaderImagePage />)
            .otherwise(() => (
              <Header title="Gallery" showBackButton={false} />
            ))}

          <ImageList className="pt-16" onScroll={setScrollY} />
        </>
      )}
    </ScrollListener>
  );
}
