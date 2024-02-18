import {
  CircularProgress,
  Stack,
  Tooltip,
  type AvatarProps,
  Box,
} from '@mui/joy';
import ProfileTabHeader from './ProfileTabHeader';
import GenericPlaceholder from '@components/GenericPlaceholder';
import TrophyBrokenIcon from '@components/icons/TrophyBrokenIcon';
import { useTunnelEndpoint } from '@hooks/tunnel';
import AchievementsModel from '@typings/models/users/achievements';
import { AchievementLogoUnlocked } from '@apps/Achievements/components/Achievement';

const sizeBadge = (size: number) => {
  if (size < 6) return 'xl';
  if (size > 10) return 'md';
  return 'lg';
};

function UserAchievement(
  props: AchievementsModel.DTO.IMixedAchievement & {
    size?: AvatarProps['size'];
  }
) {
  const {
    unlocked,
    achievement,
    userAchievement,
    currentLevel,
    previousLevel,
  } = props;
  const levelToRender =
    userAchievement && unlocked ? previousLevel! : currentLevel;
  return (
    <Tooltip title={userAchievement ? levelToRender.title : achievement.title} size="md">
      <div>
        <AchievementLogoUnlocked
          {...(props as Required<AchievementsModel.DTO.IMixedAchievement>)}
        />
      </div>
    </Tooltip>
  );
}

export default function UserAchievements({ id }: { id?: number }) {
  const { isLoading, error, data } = useTunnelEndpoint<
    | AchievementsModel.Endpoints.GetUserAchievements
    | AchievementsModel.Endpoints.GetSessionAchievements
  >(
    !id
      ? AchievementsModel.Endpoints.Targets.GetSessionAchievements
      : AchievementsModel.Endpoints.Targets.GetUserAchievements,
    !id
      ? undefined
      : {
          id,
        }
  );

  return (
    <Stack p={1} width="100%" alignItems="center" height="50%">
      <ProfileTabHeader
        title="Achievements"
        path={`/achievements/${id ?? 'me'}`}
      />
      {isLoading ? (
        <CircularProgress variant="plain" sx={{ m: 'auto' }} />
      ) : error || !data ? (
        <GenericPlaceholder
          icon={<TrophyBrokenIcon />}
          title="Failed to load achievements"
          label="Please try again later."
        />
      ) : (
        <Box
          display="flex"
          flexWrap="wrap"
          gap={1}
          width="100%"
          height="100%"
          overflow="auto"
        >
          {data.achievements.length > 0 ? (
            <>
              {data.achievements.map((achievement, index) => (
                <UserAchievement
                  key={index}
                  {...achievement}
                  size={sizeBadge(data.achievements.length)}
                />
              ))}
            </>
          ) : (
            <GenericPlaceholder
              title="No Achievements Earned"
              icon={<TrophyBrokenIcon fontSize="xl4" />}
              path="/pong/play/queue"
            />
          )}
        </Box>
      )}
    </Stack>
  );
}
