import AppsIcon from '@components/icons/AppsIcon';
import tunnel from '@lib/tunnel';
import { SvgIconProps } from '@mui/joy';
import ShopModel from '@typings/models/shop';
import React from 'react';
import { atomFamily, selector, selectorFamily } from 'recoil';

const createLazyAppIcon =
  (Icon: React.LazyExoticComponent<any>): React.FC<SvgIconProps> =>
  (props: SvgIconProps) => {
    return (
      <React.Suspense fallback={<AppsIcon {...props} />}>
        <Icon {...props} />
      </React.Suspense>
    );
  };

const iconsGlob = import.meta.glob('../icons/**/*.tsx', { eager: true });

const generatePath = (iconPath: string) => {
  const match = iconsGlob[`../icons/${iconPath}.tsx`] as any;
  return match.default;
};

const shopState = new (class ShopState {
  private initData = selector({
    key: 'shop/initData',
    get: async () => {
      return await tunnel.get(ShopModel.Endpoints.Targets.GetInitialData);
    },
  });
  categories = selector<ShopModel.Models.Category[]>({
    key: 'shop/categories',
    get: async ({ get }) => {
      const data = get(this.initData);
      return data.categories.map((c) => ({
        ...c,
        Icon: createLazyAppIcon(generatePath(c.icon)),
      }));
    },
  });
  subCategories = selectorFamily<ShopModel.Models.SubCategory[], string>({
    key: 'shop/subCategories',
    get:
      (id) =>
      async ({ get }) => {
        const data = get(this.initData);
        const category = data.categories.find((c) => c.id === id);
        if (!category) return [];
        const subCategories = category.subCategories.map((sc) => ({
          ...data.subCategories[sc],
          Icon: createLazyAppIcon(generatePath(data.subCategories[sc].icon)),
        }));
        return subCategories;
      },
  });
  subCategory = atomFamily<ShopModel.Models.SubCategory, string>({
    key: 'shop/subCategory',
    default: selectorFamily({
      key: 'shop/subCategory/default',
      get: (id) => async ({ get }) => {
        const [category, subCategory] = id.split('-');
        const computed = get(this.subCategories(category));
        return computed.find((sc) => sc.id === subCategory)!;
      },
    }),
  });

  items = atomFamily<ShopModel.Models.Item[], string>({
    key: 'shop/items',
    default: selectorFamily({
      key: 'shop/items/default',
      get: (id) => async () => {
        const [category, subCategory] = id.split('-');
        try {
          return tunnel.get(ShopModel.Endpoints.Targets.GetItems, {
            category,
            sub_category: subCategory,
          });
        } catch (error) {
          return [];
        }
      },
    }),
  });
  subCategoryPage = atomFamily<number, string>({
    key: 'shop/subCategoryPage',
    default: 1,
  });
})();

export default shopState;
