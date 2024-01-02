import NotificationsModel from '@typings/models/notifications';
import React from 'react';
import {
  NotificationBuilderTemplate,
  NotificationBuilderTemplateAction,
} from '../../types';
import notificationsState from '..';
import { useSetRecoilState } from 'recoil';

class BuilderCtx<T extends NotificationsModel.Models.INotification> {
  private readonly cache: NotificationBuilderTemplate<T>;
  constructor(tag: NotificationsModel.Models.Tags | string) {
    this.cache = {
      tag,
      Icon: notificationsState.DEFAULT_TEMPLATE_ICON,
      customActions: [],
    };
  }

  public get customRendered(): boolean {
    return !!this.cache.CustomRenderer;
  }

  public get routeIsSet(): boolean {
    return !!this.cache.routeTo;
  }

  public setIcon(
    icon: React.ReactNode | ((props: T) => React.ReactNode)
  ): this {
    if (this.customRendered)
      throw new Error("Icon shouldn't be set when custom renderer is set");
    this.cache.Icon = icon;
    return this;
  }

  public addCustomRenderer(renderer: React.ComponentType<T>): this {
    this.cache.CustomRenderer = renderer;
    return this;
  }

  public setMessageRenderer(renderer: React.ComponentType<T>): this {
    this.cache.MessageRenderer = renderer;
    return this;
  }

  public addCustomAction(action: NotificationBuilderTemplateAction): this {
    this.cache.customActions.push(action);
    return this;
  }

  public setRouteTo(routeTo: string): this {
    if (this.cache.onClick)
      throw new Error("Route shouldn't be set when onClick is set");
    this.cache.routeTo = routeTo;
    return this;
  }

  public setOnClick(onClick: NotificationBuilderTemplate<T>['onClick']): this {
    if (this.routeIsSet)
      throw new Error("OnClick shouldn't be set when route is set");
    this.cache.onClick = onClick;
    return this;
  }

  public build(): NotificationBuilderTemplate<T> {
    return this.cache;
  }

}

export const useRegisterNotificationTemplate = <
  T extends NotificationsModel.Models.INotification,
>(
  tag: NotificationsModel.Models.Tags | string,
  cb: (builder: BuilderCtx<T>) => void,
  deps: React.DependencyList = []
) => {
  const setTemplateCache = useSetRecoilState(
    notificationsState.templateCache(tag)
  );
  React.useEffect(() => {
    const builder = new BuilderCtx<T>(tag);
    cb(builder);
    setTemplateCache(builder.build() as NotificationBuilderTemplate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps]);
};
