import { useBlocked, useFriendRequests, useFriends } from '@apps/Friends/hooks';
import useFriend from '@apps/Friends/hooks/useFriend';
import AccountCancelIcon from '@components/icons/AccountCancelIcon';
import AccountIcon from '@components/icons/AccountIcon';
import AccountPlusIcon from '@components/icons/AccountPlusIcon';
import AccountRemoveIcon from '@components/icons/AccountRemoveIcon';
import CloseOctagonOutlineIcon from '@components/icons/CloseOctagonOutlineIcon';
import MessageIcon from '@components/icons/MessageIcon';
import MenuOption from '@components/menu/MenuOption';
import UsersModel from '@typings/models/users';
import React from 'react';
import { useRoute } from 'wouter';

export default function UserMenuOptions({
  user,
}: {
  user: UsersModel.Models.IUserInfo;
}): JSX.Element[] {
  const friends = useFriends();
  const blocked = useBlocked();
  const friendRequests = useFriendRequests();
  const [isFriend, isBlocked, friendRequestSent, friendId] = React.useMemo(() => {
    const isFriend = friends.includes(user?.id ?? -1);
    const isBlocked = blocked.includes(user?.id ?? -1);
    const friendRequestSent = friendRequests.some(
      (n) => n.data.uId === user?.id
    );
    return [!!isFriend, isBlocked, friendRequestSent, user?.id ?? -1];
  }, [blocked, friends, user?.id, friendRequests]);
  const { remove, block, unblock, goToProfile, goToMessages } =
    useFriend(friendId);
  const [isInProfile] = useRoute('/profile/:rest*');
  const [isInMessages] = useRoute('/messages/:rest*');
  return [
    !isInProfile && (
      <MenuOption icon={AccountIcon} onClick={goToProfile} key="go-to-profile">
        Go to Profile
      </MenuOption>
    ),
    !isInMessages && (
      <MenuOption icon={MessageIcon} onClick={goToMessages} key="send-message">
        Send Message
      </MenuOption>
    ),
    isFriend ? (
      <MenuOption
        icon={AccountRemoveIcon}
        color="danger"
        onClick={remove}
        key="remove-friend"
      >
        Remove
      </MenuOption>
    ) : !friendRequestSent && (
      <MenuOption
        icon={AccountPlusIcon}
        disabled={isBlocked}
        key="send-friend-request"
      >
        Send Friend Request
      </MenuOption>
    ),
    <MenuOption
      icon={isBlocked ? CloseOctagonOutlineIcon : AccountCancelIcon}
      color="danger"
      onClick={isBlocked ? unblock : block}
      key="block-unblock-user"
    >
      {isBlocked ? 'Unblock' : 'Block'}
    </MenuOption>,
  ].filter(Boolean) as JSX.Element[];
}
