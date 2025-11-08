import { z } from "zod";
import { create } from "zustand";
import { userDto } from "../../backend/src/routers/auth/dto/user.dto";

type State = {
  user: z.infer<typeof userDto> | null;
};

type StateActions = {
  setUser: (user: z.infer<typeof userDto> | null) => void;
};

type AppState = State & StateActions;

export const useApp = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
