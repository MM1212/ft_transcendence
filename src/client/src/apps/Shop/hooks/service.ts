// import { useKeybindsToggle } from "@hooks/keybinds";
// import { useOpenShopModalActions } from "./useOpenShopModal";
// import React from "react";

import { useRegisterInteraction } from "@apps/Lobby/state";
import { ShopInteraction } from "../state/interactions";

export const useShopService = () => {
  // const { toggle } = useOpenShopModalActions();

  // const onClick = React.useCallback(
  //   (_key: string, pressed: boolean, _ev: KeyboardEvent) => {
  //     if (!pressed) return;
  //     toggle();
  //   },
  //   [toggle]
  // );

  // useKeybindsToggle(["KeyB"], onClick, []);

  useRegisterInteraction(ShopInteraction);
};
