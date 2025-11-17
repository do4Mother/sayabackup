import { create } from "zustand";

type State = {
  selectedImages: string[];
};

type StateAction = {
  setSelectedImages: (images: string[]) => void;
};

type UseSelectedImage = State & StateAction;

export const useSelectedImage = create<UseSelectedImage>((set) => ({
  selectedImages: [],
  setSelectedImages: (images: string[]) =>
    set(() => ({
      selectedImages: images,
    })),
}));
