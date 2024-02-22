import { UserAvatar } from '@components/AvatarWithStatus';
import { useCurrentUser, useUser } from '@hooks/user';
import { Box, Chip, Stack, Tooltip } from '@mui/joy';
import { Typography } from '@mui/joy';
import PongLobbyMatchmakingBanner from './Banner';
import { ArrowSelector } from '@components/ArrowSelector/ArrowSelector';
import type UsersModel from '@typings/models/users';
import { IS_PROD } from '@apps/Lobby/src/constants';
import TrophyAwardIcon from '@components/icons/TrophyAwardIcon';

export interface PlayerBannerProps {
  showSelector?: boolean;
  onPaddleChange?: (paddle: string) => void;
  onSpecialPowerChange?: (power: string) => void;
  disabled?: boolean;
}

export interface LobbyPlayerBannerProps extends PlayerBannerProps {
  id: number;
}

function PlayerBanner({
  user,
  showSelector = true,
  onPaddleChange,
  onSpecialPowerChange,
  disabled,
}: {
  user: UsersModel.Models.IUserInfo;
} & PlayerBannerProps) {
  // add here the player's special power value
  // and
  // indexElem={Array.from(paddleConfig.keys()).indexOf(currPaddle)}
  // indexElem={Array.from(SpecialPConfig.keys()).indexOf(currPower)}
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '3dvh',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          height: '40dvh',
          width: '40vh',
          // clipPath: 'polygon(50% 90%, 76% 80%, 76% 0, 24% 0, 24% 80%)',
          // backgroundColor: 'background.surface',
        }}
      >
        <PongLobbyMatchmakingBanner
          sx={{
            position: 'absolute',
            zIndex: 0,
            mt: -0.5,
            color: 'warning.outlinedBorder',
            width: '45vh',
            height: '41dvh',
          }}
        />
        <PongLobbyMatchmakingBanner
          sx={{
            position: 'absolute',
            zIndex: 0,
            color: 'background.surface',
            width: '40vh',
            height: '40dvh',
          }}
        />
        <Box
          zIndex={1}
          display="flex"
          alignItems="center"
          flexDirection="column"
          justifyContent="space-between"
          height="100%"
          pt={3}
          pb={6}
        >
          <Stack spacing={1} width="100%" alignItems="center">
            <UserAvatar
              sx={(theme) => ({
                width: theme.spacing(15),
                height: theme.spacing(15),
                zIndex: 1,
              })}
              src={user.avatar}
            />
            <Typography>{user.nickname}</Typography>
            <Tooltip title="Elo Rating">
              <Chip
                variant="soft"
                color="warning"
                startDecorator={<TrophyAwardIcon />}
              >
                {user.leaderboard.elo}
              </Chip>
            </Tooltip>
          </Stack>
          {showSelector && (
            <Stack spacing={1}>
              <ArrowSelector
                selectType="paddle"
                onClick={onPaddleChange}
                disabled={disabled}
              />
              <ArrowSelector
                selectType="special_power"
                onClick={onSpecialPowerChange}
                disabled={disabled}
              />
            </Stack>
          )}
        </Box>
      </Box>
    </div>
  );
}

export function LobbyPlayerBanner({ id, ...props }: LobbyPlayerBannerProps) {
  if (!IS_PROD) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const self = useCurrentUser()!;
    if (self.id === id)
      throw new Error('LobbyPlayerBanner should not be used for self');
  }
  const user = useUser(id);
  if (user === null) return null;

  // add here the player's special power value
  // and
  // indexElem={Array.from(paddleConfig.keys()).indexOf(currPaddle)}
  // indexElem={Array.from(SpecialPConfig.keys()).indexOf(currPower)}
  return <PlayerBanner user={user} {...props} />;
}

export function LobbySelfBanner(props: PlayerBannerProps) {
  const user = useCurrentUser();
  if (user === null) return null;

  return <PlayerBanner user={user} {...props} />;
}

export default LobbyPlayerBanner;
