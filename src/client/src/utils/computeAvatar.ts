import publicPath from './public';

export const computeUserAvatar = (avatar: string) => {
  if (!isNaN(parseInt(avatar)))
    return publicPath(`/profile/tile${avatar.padStart(4, '0')}.webp`);
  if (avatar === 'bot')
    return publicPath(`/profile/tilebot.webp`);
  return avatar;
};
