import { create } from "zustand";
import { AppRouterOutput } from "../../backend/src/routers/routers";

type Image = AppRouterOutput["gallery"]["get"]["items"][number];

type State = {
  selectedImages: Image[];
};

type StateAction = {
  setSelectedImages: (images: Image[]) => void;
};

type UseSelectedImage = State & StateAction;

export const useSelectedImage = create<UseSelectedImage>((set) => ({
  selectedImages: [],
  setSelectedImages: (images: Image[]) =>
    set(() => ({
      selectedImages: images,
    })),
}));
