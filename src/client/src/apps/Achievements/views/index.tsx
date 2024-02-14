import { Sheet, Stack } from '@mui/joy';
import AchievementHead from '../components/AchievementHead';
import Achievement from '../components/Achievement';
import { useParams } from 'wouter';
import GenericPlaceholder from '@components/GenericPlaceholder';
import TrophyBrokenIcon from '@components/icons/TrophyBrokenIcon';
import { useCurrentUser, useUser } from '@hooks/user/index';

function MyAchievements() {
  const user = useCurrentUser();
  if (!user)
    return (
      <GenericPlaceholder
        icon={<TrophyBrokenIcon />}
        title="Failed to load achievements"
        description="Please try again later."
      />
    );
  return (
    <>
      <AchievementHead user={user} />
      <Stack
        sx={{
          width: '100%',
          height: '80%',
        }}
        overflow="auto"
      >
        <Achievement id={user.id} />
      </Stack>
    </>
  );
}

function AchievementsByUserId({id}: {id: number}) {
  const user = useUser(id);
  if (!user)
  return (
    <GenericPlaceholder
      icon={<TrophyBrokenIcon />}
      title="Failed to load achievements"
      description="Please try again later."
    />
  );
  return (
    <>
      <AchievementHead user={user} />
      <Stack
        sx={{
          width: '100%',
          height: '80%',
        }}
        overflow="auto"
      >
        <Achievement id={user.id} />
      </Stack>
    </>
  );
}

function AchievementEntries() {
  const { rest: targetId } = useParams<{ rest: string }>();

  if (targetId === 'me') return <MyAchievements />;

  if (!targetId || isNaN(parseInt(targetId)))
    return (
      <GenericPlaceholder
        icon={<TrophyBrokenIcon />}
        title="Failed to load achievements"
        description="Please try again later."
      />
    );
  return <AchievementsByUserId id={parseInt(targetId)} />;
}

export default function AchievementsPanel() {
  return (
    <Sheet
      sx={{
        width: '80dvh',
        height: '100%',
        borderLeft: '1px solid',
        borderColor: 'divider',
      }}
    >
      <AchievementEntries />
    </Sheet>
  );
}
