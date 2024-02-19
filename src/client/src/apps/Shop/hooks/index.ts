import { useRecoilState, useRecoilValue } from 'recoil';
import shopState from '../state';

export const useShopCategories = () => useRecoilValue(shopState.categories);

export const useShopSubCategories = (categoryId: string) =>
  useRecoilValue(shopState.subCategories(categoryId));

export const useShopSubCategory = (categoryId: string, subCategoryId: string) =>
  useRecoilValue(shopState.subCategory(`${categoryId}-${subCategoryId}`));

export const useShopItems = (categoryId: string, subCategoryId: string) =>
  useRecoilValue(shopState.items(`${categoryId}-${subCategoryId}`));

export const useShopSubCategoryPage = (
  categoryId: string,
  subCategoryId: string
) =>
  useRecoilState(shopState.subCategoryPage(`${categoryId}-${subCategoryId}`));
