import NotificationsModel from '@typings/models/notifications';
import { useNotificationsTemplate } from '../state';
import React from 'react';
import { Stack, Avatar, Typography } from '@mui/joy';
import { InboxMessageInjectionRoute } from './MessageInjection';

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

    // you're able to inject anything into the message (or render other stuff)
    // currently supported: {{type:route|path:routeName|label:routeLabel}}

    const args = (props.message.match(/{{(.+?)}}/g) || []).map((str, i) => {
      const data = str
        .replace(/[{}]/g, '')
        .split('||')
        .reduce(
          (acc, cur) => {
            const [key, value] = cur.split(':').map((e) => e.trim());
            acc[key] = value;
            return acc;
          },
          {} as Record<string, string>
        );
      const { type, ...args } = data;

      switch (type) {
        case 'route':
          const { path, label } = args;
          return (
            <InboxMessageInjectionRoute
              path={path}
              label={label}
              key={`message-arg-route-${path}-${label}-${i}`}
            />
          );
      }
    });
    if (args.length === 0) return props.message; // no need to split it and insert nothing, so we just might return the value that we have
    const post: React.ReactNode[] = [];
    const nbody = props.message.replace(/{{(.+?)}}/g, '\x01').split('\x01');
    nbody.forEach((str, i) => post.push(str, args[i]));
    return <>{post}</>;
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
