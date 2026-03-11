import { create } from "zustand";
import { persist } from "zustand/middleware";

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
		},
	),
);
