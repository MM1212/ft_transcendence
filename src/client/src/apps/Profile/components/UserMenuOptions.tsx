import { useBlocked, useFriends } from '@apps/Friends/hooks';
import useFriend from '@apps/Friends/hooks/useFriend';
import AccountCancelIcon from '@components/icons/AccountCancelIcon';
import AccountIcon from '@components/icons/AccountIcon';
import AccountPlusIcon from '@components/icons/AccountPlusIcon';
import AccountRemoveIcon from '@components/icons/AccountRemoveIcon';
import CloseOctagonOutlineIcon from '@components/icons/CloseOctagonOutlineIcon';
import MessageIcon from '@components/icons/MessageIcon';
import MenuOption from '@components/menu/MenuOption';
import { useUser } from '@hooks/user';
import React from 'react';
import { useRoute } from 'wouter';

export default function UserMenuOptions({ userId }: { userId: number }) {
  const user = useUser(userId);
  const friends = useFriends();
  const blocked = useBlocked();
  const [isFriend, isBlocked, friendId] = React.useMemo(() => {
    const isFriend = friends.includes(user?.id ?? -1);
    const isBlocked = blocked.includes(user?.id ?? -1);
    return [!!isFriend, isBlocked, user?.id ?? -1];
  }, [blocked, friends, user?.id]);
  const { remove, block, unblock, goToProfile, goToMessages } =
    useFriend(friendId);
  const [isInProfile] = useRoute('/profile/:rest*');
  const [isInMessages] = useRoute('/messages/:rest*');
  return (
    <>
      {!isInProfile && (
        <MenuOption icon={AccountIcon} onClick={goToProfile}>
          Go to Profile
        </MenuOption>
      )}
      {!isInMessages && (
        <MenuOption icon={MessageIcon} onClick={goToMessages}>
          Send Message
        </MenuOption>
      )}
      {isFriend ? (
        <MenuOption icon={AccountRemoveIcon} color="danger" onClick={remove}>
          Remove
        </MenuOption>
      ) : (
        <MenuOption icon={AccountPlusIcon} disabled={isBlocked}>
          Send Friend Request
        </MenuOption>
      )}
      <MenuOption
        icon={isBlocked ? CloseOctagonOutlineIcon : AccountCancelIcon}
        color="danger"
        onClick={isBlocked ? unblock : block}
      >
        {isBlocked ? 'Unblock' : 'Block'}
      </MenuOption>
    </>
  );
}
