import { sessionAtom } from "@hooks/user";
import notifications from "@lib/notifications/hooks";
import tunnel from "@lib/tunnel";
import UsersModel from "@typings/models/users";
import { useRecoilCallback } from "recoil";

const useFriend = (friendId: number) => {
  const remove = useRecoilCallback(
    (ctx) => async () => {
      try {
        const self = await ctx.snapshot.getPromise(sessionAtom);
        if (!self) throw new Error("You are not logged in");
        const resp = await tunnel.del(
          UsersModel.Endpoints.Targets.RemoveFriend,
          {
            id: self.id,
            friendId,
          }
        );
        if (resp.status !== "ok") throw new Error(resp.errorMsg);
        notifications.success("Removed friend");
      } catch (e) {
        notifications.error("Failed to remove friend", (e as Error).message);
      }
    },
    [friendId]
  );
  const block = useRecoilCallback(
    (ctx) => async () => {
      try {
        const self = await ctx.snapshot.getPromise(sessionAtom);
        if (!self) throw new Error("You are not logged in");
        const resp = await tunnel.put(
          UsersModel.Endpoints.Targets.BlockUser,
          {},
          {
            id: self.id,
            blockedId: friendId,
          }
        );
        if (resp.status !== "ok") throw new Error(resp.errorMsg);
        notifications.success("Blocked friend");
      } catch (e) {
        notifications.error("Failed to block friend", (e as Error).message);
      }
    },
    [friendId]
  );
  return { remove, block };
};

export default useFriend;
