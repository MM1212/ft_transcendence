import { useRecoilValue } from "recoil";
import inventoryState from "../state";

export const useInventory = () =>
  useRecoilValue(inventoryState.inventory);

export const useInventoryByType = (type: string) =>
  useRecoilValue(inventoryState.inventoryByType(type));