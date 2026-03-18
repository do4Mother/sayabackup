import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type State = {
	status: "loading" | "authenticated" | "unauthenticated";
	activeOrgId: string | null;
	activeOrgName: string | null;
};

type Actions = {
	setState: (status: State["status"]) => void;
	setActiveOrg: (id: string, name: string) => void;
	clearActiveOrg: () => void;
};

export const useSessions = create<State & Actions>()(
	persist(
		(set) => ({
			status: "loading",
			activeOrgId: null,
			activeOrgName: null,
			setState: (status) => set({ status }),
			setActiveOrg: (id, name) =>
				set({ activeOrgId: id, activeOrgName: name }),
			clearActiveOrg: () => set({ activeOrgId: null, activeOrgName: null }),
		}),
		{
			name: "session-storage",
			storage: createJSONStorage(() => AsyncStorage),
		},
	),
);
