import Header from "@/components/app/Header";
import ImageList from "@/components/app/ImageList";
import { Fragment } from "react";

export default function HomeTabPage() {
  return (
    <Fragment>
      <Header title="Gallery" showBackButton={false} />
      <ImageList />
    </Fragment>
  );
}
