export interface ClothingItem {
  id: number;
  name: string;
  props: {
    paper: boolean;
    icon: boolean;
    sprites: boolean;
    in_cdn: number | false;
  };
  in_shop: boolean;
  shop?: {
    description: string;
    price: number;
    subCategory: string;
  };
}