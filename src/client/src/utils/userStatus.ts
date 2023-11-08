import UsersModel from '@typings/models/users';

export const userStatusToString = (status: UsersModel.Models.Status) => {
  switch (status) {
    case UsersModel.Models.Status.Online:
      return 'Online';
    case UsersModel.Models.Status.Offline:
      return 'Offline';
    case UsersModel.Models.Status.Away:
      return 'Away';
    case UsersModel.Models.Status.Busy:
      return 'Busy';
    default:
      return 'Unknown';
  }
};

export const userStatusToColor = (status: UsersModel.Models.Status) => {
  switch (status) {
    case UsersModel.Models.Status.Online:
      return 'palette-success-400';
    case UsersModel.Models.Status.Away:
      return 'palette-warning-400';
    case UsersModel.Models.Status.Busy:
      return 'palette-danger-400';
    default:
      return 'palette-neutral-400';
  }
};
