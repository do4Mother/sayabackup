import { createContext } from "react";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { createStore } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

type State = {
  scrollY: number;
};

type Action = {
  setScrollY: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

type ScrollListenerStore = ReturnType<typeof createScrollListener>;

export const createScrollListener = () => {
  return createStore<State & Action>()(
    subscribeWithSelector((set) => ({
      scrollY: 0,
      setScrollY: (event) => {
        set({ scrollY: event.nativeEvent.contentOffset.y });
      },
    })),
  );
};

export const ScrollListenerContext = createContext<ScrollListenerStore | null>(
  null,
);

export const useScrollListener = () => {
  const store = createContext(ScrollListenerContext);

  if (!store) {
    throw new Error(
      "useScrollListener must be used within a ScrollListenerProvider",
    );
  }

  return store;
};
