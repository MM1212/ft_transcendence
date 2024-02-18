import {
  Card,
  CardContent,
  CardCover,
  Stack,
  Typography,
  Sheet,
  CircularProgress,
  Box,
  Tooltip,
} from '@mui/joy';
import { Avatar } from '@mui/joy';
import GenericPlaceholder from '@components/GenericPlaceholder';
import TrophyBrokenIcon from '@components/icons/TrophyBrokenIcon';
import { useTunnelEndpoint } from '@hooks/tunnel';
import AchievementsModel from '@typings/models/users/achievements/index';
import React from 'react';
import publicPath from '@utils/public';
import LockIcon from '@components/icons/LockIcon';
import AchievementHead, { AchievementHeadSkeleton } from './AchievementHead';
import type UsersModel from '@typings/models/users';
import ProgressHelperIcon from '@components/icons/ProgressHelperIcon';
import moment from 'moment';

const ACHIEVEMENT_LEVEL_TYPES_CSS: Record<
  AchievementsModel.Models.IAchievementLevel['type'],
  string
> = {
  gold: 'sepia(1) saturate(2)',
  silver: 'saturate(0.10)',
  bronze: 'sepia(1)',
  platinum: 'sepia(1) hue-rotate(125deg) saturate(150%)',
  diamond: 'sepia(1) hue-rotate(175deg) saturate(400%)',
};

function AchievementLogoUnlocked(
  props: Required<AchievementsModel.DTO.IMixedAchievement>
): JSX.Element {
  const {
    achievement,
    currentLevel,
    unlocked,
    previousLevel,
    userAchievement,
  } = props;
  const levelToRender =
    userAchievement && unlocked ? previousLevel! : currentLevel;
  return (
    <Avatar
      sx={(theme) => ({
        width: theme.spacing(12),
        height: theme.spacing(12),
        borderRadius: 'md',
        border: '2px solid',
        borderColor: 'divider',
        ...(levelToRender && {
          filter: ACHIEVEMENT_LEVEL_TYPES_CSS[levelToRender.type],
        }),
      })}
      src={publicPath(`/achievements/${achievement.icon}`)}
      alt={achievement.title}
    />
  );
}

function AchievementLogoLocked(
  props: AchievementsModel.DTO.IMixedAchievement
): JSX.Element {
  const {
    achievement,
    unlocked,
    userAchievement,
    currentLevel,
    previousLevel,
  } = props;
  const hasButLocked = userAchievement && !userAchievement.unlocked;
  const levelToRender =
    userAchievement && unlocked ? previousLevel! : currentLevel;
  return (
    <Tooltip size="md" title={hasButLocked ? 'In Progress' : 'Locked'}>
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
            ...(hasButLocked && {
              filter: `${
                ACHIEVEMENT_LEVEL_TYPES_CSS[levelToRender.type]
              } brightness(0.25) blur(1px)`,
            }),
          })}
          src={publicPath(`/achievements/${achievement.icon}`)}
          alt={levelToRender.title}
        />
        {hasButLocked ? (
          <ProgressHelperIcon
            style={{
              position: 'absolute',
              zIndex: 1,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        ) : (
          <LockIcon
            style={{
              position: 'absolute',
              zIndex: 1,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}
      </Box>
    </Tooltip>
  );
}

function AchievementUnlocked(
  props: AchievementsModel.DTO.IMixedAchievement & { idx: number }
): JSX.Element {
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
    <Card>
      <CardContent
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        {unlocked ? (
          <AchievementLogoUnlocked
            {...(props as Required<AchievementsModel.DTO.IMixedAchievement>)}
          />
        ) : (
          <AchievementLogoLocked {...props} />
        )}
        <Box gap={2} display="flex" flexDirection="column" flexGrow={1}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography level="body-md" fontWeight="lg">
              {userAchievement ? levelToRender.title : achievement.title}
            </Typography>
            {unlocked && (
              <Tooltip
                title={moment(userAchievement!.updatedAt).format(
                  'MMM Do, YYYY HH:mm'
                )}
              >
                <Typography level="body-xs">
                  {moment(userAchievement!.updatedAt).format('MMM Do, YYYY')}
                </Typography>
              </Tooltip>
            )}
          </Box>
          <Typography
            level="body-xs"
            sx={{
              color: `${achievement.bannerColor}.softColor`,
            }}
          >
            {levelToRender.description}
          </Typography>
          {userAchievement && (
            <Typography level="title-xs" mt="auto" ml="auto">
              {unlocked ? 'Next Level' : 'Unlocks At'}:{' '}
              <Typography
                level="body-xs"
                sx={{
                  color: `${achievement.bannerColor}.softColor`,
                }}
              >
                {String(userAchievement.meta[currentLevel.milestone.metaKey])}/
                {String(currentLevel.milestone.metaValue)}
              </Typography>{' '}
              {achievement.trackMessageSuffix}
            </Typography>
          )}
        </Box>
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
            bgcolor: `${achievement.bannerColor}.softBg`,
          }}
        />
      </CardCover>
    </Card>
  );
}

export default function Achievements(user: UsersModel.Models.IUserInfo) {
  const [fetchAll, setFetchAll] = React.useState(false);
  const { data, isLoading, error } =
    useTunnelEndpoint<AchievementsModel.Endpoints.GetUserAchievements>(
      AchievementsModel.Endpoints.Targets.GetUserAchievements,
      { all: fetchAll, userId: user.id }
    );
  const acquiredAchievementsLength = React.useMemo(
    () => (data ? data.achievements.filter((a) => a.unlocked) : []).length,
    [data]
  );
  if (isLoading)
    return (
      <>
        <AchievementHeadSkeleton />
        <CircularProgress variant="plain" sx={{ m: 'auto' }} />
      </>
    );
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
      <AchievementHead
        user={user}
        acquired={acquiredAchievementsLength}
        total={total}
        checked={fetchAll}
        changer={() => setFetchAll(!fetchAll)}
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
          achievements.map((achievement, index) => (
            <AchievementUnlocked
              key={achievement.achievement.tag}
              {...achievement}
              idx={index}
            />
          ))
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
              label="Check 'Show All' to see all achievements"
            />
          </div>
        )}
      </Stack>
    </>
  );
}
