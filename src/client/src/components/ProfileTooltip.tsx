import {
  Box,
  Button,
  Divider,
  Sheet,
  Stack,
  Tooltip,
  TooltipProps,
  Typography,
  tooltipClasses,
} from '@mui/joy';
import UsersModel from '@typings/models/users';
import React from 'react';
import AvatarWithStatus from './AvatarWithStatus';
import moment from 'moment';
import AccountIcon from './icons/AccountIcon';
import MessageIcon from './icons/MessageIcon';
import useFriend from '@apps/Friends/hooks/useFriend';
import { computeUserAvatar } from '@utils/computeAvatar';
// @ts-expect-error not typed
import ColorThief from 'colorthief';
import { darken } from '@theme';

export interface IProfileTooltipProps {
  user: UsersModel.Models.IUserInfo;
  placement?: TooltipProps['placement'];
  children: TooltipProps['children'];
  badges?: React.ReactNode[];
  enterDelay?: number;
}
const colorThief = new ColorThief();

function ProfileTooltipContent({
  user,
  badges,
}: {
  user: UsersModel.Models.IUserInfo;
  badges?: React.ReactNode[];
}) {
  const { goToMessages, goToProfile } = useFriend(user.id);
  const [averageAvatarColor, setAverageAvatarColor] = React.useState<
    string | undefined
  >();

  React.useEffect(() => {
    colorThief.getColorFromUrl(
      computeUserAvatar(user.avatar),
      (color: number[]) => setAverageAvatarColor(`rgb(${color.join(',')})`),
      undefined
    );
  }, [user.avatar]);
  return (
    <Box
      display="flex"
      minWidth={{
        xs: '90dvh',
        sm: '25dvh',
      }}
      minHeight={{
        xs: '90dvh',
        sm: '30dvh',
      }}
      flexDirection="column"
      position="relative"
      overflow="hidden"
      sx={{
        backgroundColor: 'background.level1',
      }}
      borderRadius="sm"
      border="1px solid"
      borderColor="divider"
    >
      <Box
        display="flex"
        m={1}
        justifyContent="space-between"
        alignItems="flex-end"
      >
        <Sheet
          sx={{
            width: '100%',
            position: 'absolute',
            height: '3rem',
            backgroundImage: theme =>  {
              const color = averageAvatarColor ?? theme.resolveVar('palette-neutral-400');
              return `linear-gradient(45deg, ${darken(
                color,
                0.4
              )}, ${color})`
            },
            top: 0,
            left: 0,
          }}
        />
        <AvatarWithStatus
          status={user.status}
          src={user.avatar}
          size="xl"
          variant="outlined"
          inset="16%"
          sx={{
            borderWidth: (theme) => theme.spacing(0.25),
            borderColor: 'background.level1',
          }}
          background="level1"
        />
        {badges?.length ? (
          <Stack
            spacing={0.5}
            direction="row"
            alignItems="center"
            bgcolor="background.surface"
            px={0.5}
            py={0.25}
            borderRadius="sm"
          >
            {badges}
          </Stack>
        ) : null}
      </Box>
      <Sheet
        sx={{
          flexGrow: 1,
          m: 1,
          mt: 0,
          p: 1,
          borderRadius: 'sm',
          backgroundColor: 'background.surface',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography level="title-lg">{user.nickname}</Typography>
        <Divider
          sx={{
            my: 1,
          }}
        />
        <Stack spacing={0.25}>
          <Typography
            level="title-sm"
            textTransform="uppercase"
            fontWeight={600}
            fontSize=".5rem"
          >
            Member since
          </Typography>
          <Typography level="body-xs" fontSize=".25rem">
            {moment(user.createdAt).format('MMM Do YYYY')}
          </Typography>
        </Stack>
        <Stack mt="auto" spacing={1} direction="row" alignItems="center">
          <Button
            variant="outlined"
            color="neutral"
            startDecorator={<AccountIcon />}
            size="sm"
            onClick={goToProfile}
          >
            Profile
          </Button>
          <Button
            variant="outlined"
            color="neutral"
            startDecorator={<MessageIcon size="sm" />}
            size="sm"
            onClick={goToMessages}
          >
            Message
          </Button>
        </Stack>
      </Sheet>
    </Box>
  );
}

export default function ProfileTooltip({
  placement = 'top',
  children,
  enterDelay = 250,
  ...rest
}: IProfileTooltipProps): JSX.Element {
  return (
    <Tooltip
      placement={placement}
      variant="soft"
      title={<ProfileTooltipContent {...rest} />}
      arrow={false}
      enterDelay={enterDelay}
      enterNextDelay={enterDelay}
      sx={{
        [`&.${tooltipClasses.root}`]: {
          p: 0,
          backgroundColor: 'unset',
          borderRadius: 0,
          boxShadow: (theme) => theme.shadow.md,
        },
      }}
    >
      {React.cloneElement(children, {
        style: {
          cursor: 'pointer',
        },
      })}
    </Tooltip>
  );
}
