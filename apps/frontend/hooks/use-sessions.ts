import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type State = {
	status: "loading" | "authenticated" | "unauthenticated";
};

type Actions = {
	setState: (status: State["status"]) => void;
};

export const useSessions = create<State & Actions>()(
	persist(
		(set) => ({
			status: "loading",
			setState: (status) => set({ status }),
		}),
		{
			name: "session-storage",
			storage: createJSONStorage(() => AsyncStorage),
		},
	),
);
