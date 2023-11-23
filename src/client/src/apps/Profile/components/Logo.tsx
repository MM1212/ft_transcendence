import { useModalActions } from '@hooks/useModal';
import { useCurrentUser } from '@hooks/user';
import { UserAvatar } from '../../../components/AvatarWithStatus';

export default function Logo(): JSX.Element {
  const { open } = useModalActions('profile:change-user');
  const user = useCurrentUser();
  return (
    <UserAvatar
      src={user?.avatar}
      onClick={open}
      style={{ cursor: 'pointer' }}
    />
  );
}
