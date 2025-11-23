import { create } from "zustand";

type State = {
  open: boolean;
  title: string;
  message: string;
};

type Action = {
  showAlert: (title: string, message: string) => void;
  setOpen: (open: boolean) => void;
};

export const useAlert = create<State & Action>((set) => ({
  open: false,
  title: "",
  message: "",
  showAlert: (title, message) => set({ open: true, title, message }),
  setOpen: (open) => set({ open }),
}));
