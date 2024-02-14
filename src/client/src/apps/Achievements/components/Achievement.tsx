import {
  Card,
  CardContent,
  CardCover,
  Stack,
  Typography,
  Sheet,
  CircularProgress,
} from '@mui/joy';
import { Avatar } from '@mui/joy';
import GenericPlaceholder from '@components/GenericPlaceholder';
import TrophyBrokenIcon from '@components/icons/TrophyBrokenIcon';
import { useTunnelEndpoint } from '@hooks/tunnel';
import AchievementsModel from '@typings/models/users/achievements/index';
import * as React from 'react';
import { InternalEndpointResponse } from '@typings/api/index';
import publicPath from '@utils/public';

export const backGroundImg =
  'https://png.pngtree.com/thumb_back/fh260/background/20200714/pngtree-modern-double-color-futuristic-neon-background-image_351866.jpg';

// export default function AchievementAsset(){
//   return {

//   }
// }
  

export default function Achievement({ id }: { id: number }) {
  const [fetchAll, setFetchAll] = React.useState(false);
  const {
    data: achievements,
    isLoading,
    error,
    isValidating,
  }: {
    data: InternalEndpointResponse<AchievementsModel.Endpoints.GetUserAchievements>;
    isLoading: boolean;
    error: any;
    isValidating: boolean;
  } = useTunnelEndpoint<AchievementsModel.Endpoints.GetUserAchievements>(
    AchievementsModel.Endpoints.Targets.GetUserAchievements,
    { all: fetchAll, userId: id }
  );
  if (isLoading || isValidating) return <CircularProgress variant="plain" />;
  if (error || !achievements)
    return (
      <GenericPlaceholder
        icon={<TrophyBrokenIcon />}
        title="Failed to load achievements"
        description="Please try again later."
      />
    );
  return (
    <>
      <Stack p={1} spacing={1} height={'100%'}>
        {achievements.length > 0 ? (
          achievements.map((achievement, index) => (
            <Card
              sx={{
                flexDirection: 'row',
                filter: 'grayscale(1.0)',
                opacity: 0.6,
              }}
              key={index}
            >
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
                    borderRadius: 0,
                  })}
                  src={achievement.config.icon}
                  alt={`Achievement ${index}`}
                />
                <Stack spacing={2}>
                  <Typography level="body-md" fontWeight="lg" textColor="#fff">
                    {/* {achievements[index]} */}
                    {achievement.config.title}
                  </Typography>
                  <Typography level="body-xs" textColor="#eec">
                    {/* {achievements[index]} */}
                    {achievement.config.description}
                    ola adeus
                  </Typography>
                </Stack>
              </CardContent>
              <CardCover>
                <Sheet
                  variant="solid"
                  color="neutral"
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'blur(4px)',
                    opacity: 0.4,
                  }}
                />
                {
                  <img
                    src={publicPath('/loginPage.webp')}
                    alt="background"
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: 'blur(4px)',
                      opacity: 0.4,
                    }}
                  />
                }
              </CardCover>
            </Card>
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
              path=""
            />
          </div>
        )}
      </Stack>
    </>
  );
}
