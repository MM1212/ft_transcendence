import NotificationsModel from '@typings/models/notifications';
import User from '../..';
import UserExtBase from '../Base';

type Alert = NotificationsModel.DTO.Alert;

class UserExtAlerts extends UserExtBase {
  constructor(user: User) {
    super(user);
  }

  private get sse() {
    return this.helpers.sseService;
  }

  async send(
    type: Alert['color'],
    title: string,
    message: string,
    props?: Partial<Alert>,
  ): Promise<boolean>;
  async send(
    type: Alert['color'],
    message: string,
    props?: Partial<Alert>,
  ): Promise<boolean>;
  async send(alert: Alert): Promise<boolean>;
  async send(
    typeOrAlert: Alert['color'] | Alert,
    titleOrMessage?: string,
    messageOrProps?: string | Partial<Alert>,
    props?: Partial<Alert>,
  ): Promise<boolean> {
    let alert: Alert;
    if (typeof typeOrAlert === 'string') {
      if (typeof messageOrProps !== 'string') {
        props = messageOrProps;
        messageOrProps = titleOrMessage;
        titleOrMessage = undefined;
      }

      alert = {
        color: typeOrAlert,
        title: titleOrMessage as string,
        message: messageOrProps as string,
        ...(props as Partial<Alert>),
      };
    } else if (typeOrAlert !== undefined) {
      alert = typeOrAlert;
    } else throw new Error('Invalid alert');
    if (!this.user.isConnected) return false;
    this.sse.emitTo<NotificationsModel.Sse.SendAlertEvent>(
      NotificationsModel.Sse.Events.SendAlert,
      this.user.id,
      alert,
    );
    return true;
  }
}

export default UserExtAlerts;
