import { Stack, Tooltip } from '@mui/joy';
import ProfileTabHeader from './ProfileTabHeader';
import { Avatar } from '@mui/joy';
import GenericPlaceholder from '@components/GenericPlaceholder';
import TrophyBrokenIcon from '@components/icons/TrophyBrokenIcon';


export default function UserAchievements({ id }: { id?: number }) {
  const myAchievements: string[] = [
    // IetiBadgeAchievment,
    // OctopBadgeAchievement,
    // IetiBadgeAchievment,
    // OctopBadgeAchievement,
    // IetiBadgeAchievment,
    // OctopBadgeAchievement,
  ];
  const achievementsName: string[] = [
    'IetiBadge',
    'OctopBadge',
    'RedBadge',
    'OctopBadge',
  ];

  const sizeBadge = (array: string[]) => {
    if (array.length < 6) return 'xl';
    if (array.length > 10) return 'md';
    return 'lg';
  };

  return (
    <Stack p={1} width="100%" alignItems="center" height="50%">
      <ProfileTabHeader
        title="Achievements"
        path={`/achievements/${id ?? 'me'}`}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-evenly',
          alignContent: 'center',
          height: '100%',
          width: '100%',
        }}
      >
        {myAchievements.length > 0 ? (
          <>
            {myAchievements.map((achievement, index) => (
              <Tooltip title={achievementsName[index]} size="sm" key={index}>
                <Avatar
                  size={sizeBadge(myAchievements)}
                  src={achievement}
                  alt={`Achievement ${index}`}
                />
              </Tooltip>
            ))}
          </>
        ) : (
          <GenericPlaceholder
            title="No Achievements Earned"
            icon={<TrophyBrokenIcon fontSize="xl4" />}
            path="/pong/play/queue"
          />
        )}
      </div>
    </Stack>
  );
}
