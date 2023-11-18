import { Box, Button } from "@mui/joy";
import { CardCover } from "@mui/joy";
import { Card } from "@mui/joy";
import UsersModel from "@typings/models/users";
import { buildTunnelEndpoint } from "@hooks/tunnel";
import { AuthModel } from "@typings/models";
import { State, mutate } from "swr";
import notifications from "@lib/notifications/hooks";
import { useCurrentUser } from "@hooks/user";
import tunnel from "@lib/tunnel";
import { IUser } from "@typings/user";
import * as React from "react";

export default function CustomizationBox({
  clicable,
  imageUrl,
  selected,
  size = 150
}: {
  clicable: boolean;
  imageUrl: string;
  selected?: boolean;
  size?: number;
}) {
  const user = useCurrentUser();
  const [loading, setLoading] = React.useState(false);
  const submitProperties = React.useCallback(
    async (avatar: string) => {
      if (!user) return;
      try {
        setLoading(true);
        await tunnel.patch(
          UsersModel.Endpoints.Targets.PatchUser,
          {
            avatar,
          },
          {
            id: user.id,
          }
        );
        mutate(
          buildTunnelEndpoint(AuthModel.Endpoints.Targets.Session),
          undefined,
          {
            revalidate: true,
          }
        );
        notifications.success("User updated!");
      } catch (error) {
        notifications.error("Could not update user", (error as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  return (
    <Box
      component="ul"
      justifyContent="center"
      sx={{ display: "flex", gap: 2, flexWrap: "wrap", p: 1.5, m: 0 }}
    >
      <Card component="li" sx={{ width: size, height: size }}>
        <CardCover sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: selected ? 'background.level1' : 'unset'
        }}>
          <img src={imageUrl} style={{
            width: "auto",
            height: "auto",
            maxWidth: size,
          }}  />
        </CardCover>
        {clicable && (
          <Button
            onClick={() => {
              if (getPiece) {
                submitProperties(imageUrl);
              }
            }}
            sx={{
              height: "100%",
              width: "100%",
              backgroundColor: "unset",
              "&:hover": {
                backgroundColor: "unset",
              },
            }}
          ></Button>
        )}
      </Card>
    </Box>
  );
}
