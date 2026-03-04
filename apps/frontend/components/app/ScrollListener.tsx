import {
  createScrollListener,
  ScrollListenerContext,
} from "@/hooks/useScrollListener";
import { ReactNode, useRef } from "react";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

type ScrollListenerProps = {
  children: (
    setScrollY: (event: NativeSyntheticEvent<NativeScrollEvent>) => void,
  ) => ReactNode;
};

export function ScrollListener(props: ScrollListenerProps) {
  const store = useRef(createScrollListener()).current;
  const setScrollY = store.getState().setScrollY;

  return (
    <ScrollListenerContext.Provider value={store}>
      {props.children(setScrollY)}
    </ScrollListenerContext.Provider>
  );
}
