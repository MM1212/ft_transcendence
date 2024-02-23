import UsersModel from '@typings/models/users';
import type { GroupEnumValues } from '@typings/utils';

export const userStatusToString = (status: UsersModel.Models.Status | GroupEnumValues<UsersModel.Models.Status>) => {
  switch (status) {
    case UsersModel.Models.Status.Online:
      return 'online';
    case UsersModel.Models.Status.Offline:
      return 'offline';
    case UsersModel.Models.Status.Away:
      return 'away';
    case UsersModel.Models.Status.Busy:
      return 'busy';
    case UsersModel.Models.Status.InGame:
      return 'in game';
    default:
      return 'unknown';
  }
};

export const userStatusToColor = (status: UsersModel.Models.Status | GroupEnumValues<UsersModel.Models.Status>) => {
  switch (status) {
    case UsersModel.Models.Status.Online:
      return 'palette-success-400';
    case UsersModel.Models.Status.Away:
      return 'palette-warning-400';
    case UsersModel.Models.Status.Busy:
      return 'palette-danger-400';
    case UsersModel.Models.Status.InGame:
      return 'palette-primary-400';
    default:
      return 'palette-neutral-400';
  }
};
