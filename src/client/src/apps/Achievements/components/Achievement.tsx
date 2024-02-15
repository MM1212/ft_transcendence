import {
  Card,
  CardContent,
  CardCover,
  Stack,
  Typography,
  Sheet,
  CircularProgress,
  Checkbox,
  Box,
} from '@mui/joy';
import { Avatar } from '@mui/joy';
import GenericPlaceholder from '@components/GenericPlaceholder';
import TrophyBrokenIcon from '@components/icons/TrophyBrokenIcon';
import { useTunnelEndpoint } from '@hooks/tunnel';
import AchievementsModel from '@typings/models/users/achievements/index';
import React from 'react';
import publicPath from '@utils/public';
import LockIcon from '@components/icons/LockIcon';
import AchievementHead from './AchievementHead';
import type UsersModel from '@typings/models/users';

function AchievementUnlocked(
  achievement: AchievementsModel.DTO.IMixedAchievement & { idx: number }
): JSX.Element {
  if (!achievement.unlocked) return <></>;
  return (
    <Card>
      <CardContent
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          pr: 15,
        }}
      >
        <Avatar
          sx={(theme) => ({
            width: theme.spacing(12),
            height: theme.spacing(12),
            borderRadius: 'md',
            border: '2px solid',
            borderColor: 'divider',
            ...(achievement.idx === 0 && {
              filter: 'sepia(1) saturate(2)',
            }),
            ...(achievement.idx === 1 && {
              filter: 'saturate(0.10)',
            }),
            ...(achievement.idx === 2 && {
              filter: 'sepia(1)',
            }),
          })}
          src={publicPath(`/achievements/${achievement.config.icon}`)}
          alt={achievement.config.title}
        />
        <Stack spacing={2}>
          <Typography level="body-md" fontWeight="lg">
            {achievement.config.title}
          </Typography>
          <Typography
            level="body-xs"
            sx={{
              color: `${achievement.config.bannerColor}.softColor`,
            }}
          >
            {achievement.config.description}
          </Typography>
        </Stack>
      </CardContent>
      <CardCover>
        <Sheet
          variant="solid"
          color="neutral"
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(4px)',
            opacity: 0.4,
            bgcolor: `${achievement.config.bannerColor}.softBg`,
          }}
        />
      </CardCover>
    </Card>
  );
}

function AchievementLocked(
  achievement: AchievementsModel.Models.IAchievement
): JSX.Element {
  return (
    <Card>
      <CardContent
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          pr: 15,
        }}
      >
        <Box
          sx={(theme) => ({
            width: theme.spacing(12),
            height: theme.spacing(12),
            position: 'relative',
          })}
        >
          <Avatar
            sx={(theme) => ({
              width: theme.spacing(12),
              height: theme.spacing(12),
              borderRadius: 'md',
              border: '2px solid',
              borderColor: 'divider',
              filter: 'brightness(0.25) blur(1px)',
            })}
            src={publicPath(`/achievements/${achievement.icon}`)}
            alt={achievement.title}
          />
          <LockIcon
            style={{
              position: 'absolute',
              zIndex: 1,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </Box>
        <Stack spacing={2}>
          <Typography level="body-md" fontWeight="lg">
            {achievement.title}
          </Typography>
          <Typography
            level="body-xs"
            sx={{
              color: `${achievement.bannerColor}.softColor`,
            }}
          >
            {achievement.description}
          </Typography>
        </Stack>
      </CardContent>
      <CardCover>
        <Sheet
          variant="solid"
          color="neutral"
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(4px)',
            opacity: 0.4,
            bgcolor: `neutral.softBg`,
          }}
        />
      </CardCover>
    </Card>
  );
}

export default function Achievements(user: UsersModel.Models.IUserInfo) {
  const [fetchAll, setFetchAll] = React.useState(true);
  const { data, isLoading, error, isValidating } =
    useTunnelEndpoint<AchievementsModel.Endpoints.GetUserAchievements>(
      AchievementsModel.Endpoints.Targets.GetUserAchievements,
      { all: fetchAll, userId: user.id }
    );
  const acquiredAchievementsLength = React.useMemo(
    () => (data ? data.achievements.filter((a) => a.unlocked) : []).length,
    [data]
  );
  if (isLoading || isValidating) return <CircularProgress variant="plain" />;
  if (error || !data)
    return (
      <GenericPlaceholder
        icon={<TrophyBrokenIcon />}
        title="Failed to load achievements"
        label="Please try again later."
      />
    );
  const { achievements, total } = data;
  return (
    <>
      {/* <Checkbox
        checked={fetchAll}
        onChange={() => setFetchAll(!fetchAll)}
        label="Show All"
      /> */}
      <AchievementHead
        user={user}
        acquired={acquiredAchievementsLength}
        total={total}
      />
      <Stack
        p={1}
        spacing={1}
        sx={{
          width: '100%',
          flexGrow: 1,
        }}
        overflow="auto"
      >
        {achievements.length > 0 ? (
          achievements.map((achievement, index) =>
            achievement.unlocked ? (
              <AchievementUnlocked {...achievement} key={index} idx={index} />
            ) : (
              <AchievementLocked {...achievement} key={index} />
            )
          )
        ) : (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <GenericPlaceholder
              title="No Achievements Earned"
              icon={<TrophyBrokenIcon fontSize="xl4" />}
              path=""
            />
          </div>
        )}
      </Stack>
    </>
  );
}
