import Badge from "@mui/joy/Badge";
import Avatar, { AvatarProps } from "@mui/joy/Avatar";

type AvatarWithStatusProps = AvatarProps & {
  online?: boolean;
};

export default function AvatarWithStatus({
  online = false,
  size,
  ...rest
}: AvatarWithStatusProps) {
  return (
    <div>
      <Badge
        color={online ? "success" : "neutral"}
        variant={online ? "solid" : "soft"}
        size="sm"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        badgeInset="14%"
      >
        <Avatar size={size} {...rest} />
      </Badge>
    </div>
  );
}
