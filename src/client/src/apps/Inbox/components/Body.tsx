import NotificationsModel from '@typings/models/notifications';
import { useNotificationsTemplate } from '../state';
import React from 'react';
import { Stack, Avatar, Typography } from '@mui/joy';

export default function NotificationBody(
  props: NotificationsModel.Models.INotification
) {
  const template = useNotificationsTemplate(props.tag);
  const renderedIcon = React.useMemo(() => {
    if (typeof template.Icon === 'function') return template.Icon(props);

    return template.Icon;
  }, [template, props]);

  const renderedMessage = React.useMemo(() => {
    if (template.MessageRenderer)
      return React.createElement(template.MessageRenderer, props);

    return props.message;
  }, [template, props]);
  return React.useMemo(
    () => (
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Avatar variant="soft">{renderedIcon}</Avatar>
        <Stack direction="column" spacing={0}>
          <Typography level="title-sm" component="span">
            {props.title}
          </Typography>
          <Typography level="body-sm" component="span">
            {renderedMessage}
          </Typography>
        </Stack>
      </Stack>
    ),
    [props.title, renderedIcon, renderedMessage]
  );
}
