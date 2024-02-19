import type LobbyModel from "@typings/models/lobby";

export interface ClothingItem {
  id: number;
  name: string;
  props: {
    paper: boolean;
    icon: boolean;
    sprites: boolean;
    in_cdn: number | false;
    back_item?: boolean;
  };
  in_shop: boolean;
  shop?: {
    description: string;
    price: number;
    subCategory: string;
  };
}