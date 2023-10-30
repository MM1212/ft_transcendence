import { Alert, AlertProps, Button, IconButton, Typography } from '@mui/joy';
import React from 'react';
import { ExternalToast, ToastT, toast } from 'sonner';
import { faClose } from '@fortawesome/free-solid-svg-icons/faClose';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons/faInfoCircle';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
import { faWarning } from '@fortawesome/free-solid-svg-icons/faWarning';
import { faStop } from '@fortawesome/free-solid-svg-icons/faStop';
import Icon from '@components/Icon';

type NotificationComponentProps = Pick<
  AlertProps,
  'variant' | 'color' | 'invertedColors' | 'sx'
> & {
  handle: string | number;
  icon?: React.ReactNode;
  dismissable?: boolean;
  onClose?: () => void;
  action?: {
    label: React.ReactNode;
    onClick: () => void;
    props?: React.ComponentProps<typeof Button>;
  };
} & (
    | {
        children: React.ReactNode;
        title: never;
        description: never;
        message: never;
      }
    | {
        title: string;
        description?: string;
        message: never;
        children: never;
      }
    | {
        message: string;
        title: never;
        description: never;
        children: never;
      }
  );

export type NotificationProps = ExternalToast & NotificationComponentProps;

function NotificationWrapper({
  icon,
  children,
  title,
  description,
  message,
  dismissable = true,
  color = 'neutral',
  action,
  handle,
  ...rest
}: NotificationComponentProps): JSX.Element {
  return (
    <Alert
      key={handle}
      color={color}
      {...rest}
      sx={{ width: 'var(--width)', gap: 2, boxShadow: 'md' }}
      startDecorator={icon}
      endDecorator={
        <>
          {action && (
            <Button
              variant="plain"
              color={color}
              {...action.props}
              onClick={action.onClick}
              sx={{
                mr: 1,
                ...action.props?.sx,
              }}
            >
              {action.label}
            </Button>
          )}
          {dismissable ? (
            <IconButton
              size="sm"
              color={color}
              variant="soft"
              onClick={() => {
                rest.onClose?.();
                toast.dismiss(handle);
              }}
            >
              <Icon icon={faClose} />
            </IconButton>
          ) : undefined}
        </>
      }
    >
      {children ?? message ?? (
        <div>
          <Typography level="title-lg">{title}</Typography>
          <Typography level="body-sm">{description}</Typography>
        </div>
      )}
    </Alert>
  );
}
/* static default(props: Omit<NotificationProps, 'color'>): Notification {
  return new Notification({
    icon: <Icon icon={faInfoCircle} />,
    ...props,
    color: 'neutral',
  } as NotificationProps);
}
static success(props: Omit<NotificationProps, 'color'>): Notification {
  return new Notification({
    icon: <Icon icon={faCheck} />,
    ...props,
    color: 'success',
  } as NotificationProps);
}
static warning(props: Omit<NotificationProps, 'color'>): Notification {
  return new Notification({
    icon: <Icon icon={faWarning} />,
    ...props,
    color: 'warning',
  } as NotificationProps);
}
static error(props: Omit<NotificationProps, 'color'>): Notification {
  return new Notification({
    icon: <Icon icon={faStop} />,
    ...props,
    color: 'danger',
  } as NotificationProps);
} */
class Notification {
  public handle: string | number = '';
  constructor(
    private settings: NotificationProps,
    public readonly id: string = Math.random().toString(36).slice(2)
  ) {
    settings.id = id;
    if (settings.duration === -1) settings.duration = Infinity;
    toast.custom((_id) => {
      this.handle = _id;
      return <NotificationWrapper {...settings} handle={this.handle} />;
    }, settings);
  }
  dismiss(): Notification {
    toast.dismiss(this.handle);
    return this;
  }
  update(props: Partial<NotificationProps>): Notification {
    this.settings = { ...this.settings, ...props } as NotificationProps;
    if (this.settings.duration === -1) this.settings.duration = Infinity;
    toast.custom((_id) => {
      this.handle = _id;
      return <NotificationWrapper {...this.settings} handle={this.handle} />;
    }, this.settings);
    return this;
  }
}

class NotificationsAPI {
  create(props: NotificationProps): Notification {
    return new Notification(props);
  }
  default(
    message: React.ReactNode,
    props?: Omit<NotificationProps, 'color'> | undefined
  ): Notification;
  default(
    title: React.ReactNode,
    description: React.ReactNode,
    props?: Omit<NotificationProps, 'color'> | undefined
  ): Notification;
  default(props: Omit<NotificationProps, 'color'>): Notification;
  default(
    title: unknown,
    description?: unknown,
    props?: unknown
  ): Notification {
    let message: React.ReactNode | undefined;
    if (description === undefined) props = title;
    else if (props === undefined) {
      if (typeof description !== 'string') {
        props = description;
        message = title as string;
        title = undefined;
      }
    }
    return new Notification({
      icon: <Icon icon={faInfoCircle} />,
      ...(props as NotificationProps),
      color: 'neutral',
      message,
      title,
      description,
    } as NotificationProps);
  }
  info(
    message: React.ReactNode,
    props?: Omit<NotificationProps, 'color'> | undefined
  ): Notification;
  info(
    title: React.ReactNode,
    description: React.ReactNode,
    props?: Omit<NotificationProps, 'color'> | undefined
  ): Notification;
  info(props: Omit<NotificationProps, 'color'>): Notification;
  info(
    title: unknown,
    description?: unknown,
    props?: unknown
  ): Notification {
    let message: React.ReactNode | undefined;
    if (description === undefined) props = title;
    else if (props === undefined) {
      if (typeof description !== 'string') {
        props = description;
        message = title as string;
        title = undefined;
      }
    }
    return new Notification({
      icon: <Icon icon={faInfoCircle} />,
      ...(props as NotificationProps),
      color: 'primary',
      message,
      title,
      description,
    } as NotificationProps);
  }
  success(
    message: React.ReactNode,
    props?: Omit<NotificationProps, 'color'> | undefined
  ): Notification;
  success(
    title: React.ReactNode,
    description: React.ReactNode,
    props?: Omit<NotificationProps, 'color'> | undefined
  ): Notification;
  success(props: Omit<NotificationProps, 'color'>): Notification;
  success(
    title: unknown,
    description?: unknown,
    props?: unknown
  ): Notification {
    let message: React.ReactNode | undefined;
    if (description === undefined) props = title;
    else if (props === undefined) {
      if (typeof description !== 'string') {
        props = description;
        message = title as string;
        title = undefined;
      }
    }
    return new Notification({
      icon: <Icon icon={faCheck} />,
      ...(props as NotificationProps),
      color: 'success',
      message,
      title,
      description,
    } as NotificationProps);
  }
  warning(
    message: React.ReactNode,
    props?: Omit<NotificationProps, 'color'> | undefined
  ): Notification;
  warning(
    title: React.ReactNode,
    description: React.ReactNode,
    props?: Omit<NotificationProps, 'color'> | undefined
  ): Notification;
  warning(props: Omit<NotificationProps, 'color'>): Notification;
  warning(
    title: unknown,
    description?: unknown,
    props?: unknown
  ): Notification {
    let message: React.ReactNode | undefined;
    if (description === undefined) props = title;
    else if (props === undefined) {
      if (typeof description !== 'string') {
        props = description;
        message = title as string;
        title = undefined;
      }
    }
    return new Notification({
      icon: <Icon icon={faWarning} />,
      ...(props as NotificationProps),
      color: 'warning',
      message,
      title,
      description,
    } as NotificationProps);
  }
  error(
    message: React.ReactNode,
    props?: Omit<NotificationProps, 'color'> | undefined
  ): Notification;
  error(
    title: React.ReactNode,
    description: React.ReactNode,
    props?: Omit<NotificationProps, 'color'> | undefined
  ): Notification;
  error(props: Omit<NotificationProps, 'color'>): Notification;
  error(title: unknown, description?: unknown, props?: unknown): Notification {
    let message: React.ReactNode | undefined;
    if (description === undefined) props = title;
    else if (props === undefined) {
      if (typeof description !== 'string') {
        props = description;
        message = title as string;
        title = undefined;
      }
    }
    return new Notification({
      icon: <Icon icon={faStop} />,
      ...(props as NotificationProps),
      color: 'danger',
      message,
      title,
      description,
    } as NotificationProps);
  }
}

const notifications = new NotificationsAPI();

export default notifications;