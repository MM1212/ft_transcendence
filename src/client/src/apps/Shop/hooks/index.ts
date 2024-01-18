import { useRecoilValue } from 'recoil';
import shopState from '../state';

export const useShopCategories = () => useRecoilValue(shopState.categories);

export const useShopSubCategories = (categoryId: string) =>
  useRecoilValue(shopState.subCategories(categoryId));

export const useShopItems = (categoryId: string, subCategoryId: string) =>
  useRecoilValue(shopState.items(`${categoryId}-${subCategoryId}`));