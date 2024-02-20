import publicPath from '@utils/public';

export const LOBBY_BG_BACK_ASSET_URL = publicPath('/lobby.webp');
// export const LOBBY_BG_FRONT_ASSET_URL = publicPath('lobby-front-layer.webp');
export const LOBBY_BASE_CHAR_PENGUIN_ASSETS = [
  '/penguin/base/asset.json',
  '/penguin/body/asset.json',
].map(publicPath);

export const IS_PROD = import.meta.env.PROD;
