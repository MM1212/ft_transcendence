import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Button,
  FormHelperText,
} from "@mui/joy";
import tunnel from "@lib/tunnel";
import UsersModel from "@typings/models/users";
import { useRecoilCallback, useSetRecoilState } from "recoil";
import { roomPlayersTester } from "../state";
export default function AddFriendRoom({
  setOpen,
  open,
  roomSize,
}: {
  setOpen: (value: boolean) => void;
  open: boolean;
  roomSize: number;
}) {
  const [inputValue, setInputValue] = useState<string>("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const setRoomPlayers = useSetRecoilState(roomPlayersTester); // Use the Recoil hook to set the atom state

  const handleSubmit = useRecoilCallback(
    (ctx) =>
      async () => {
        const roomPlayers = await ctx.snapshot.getPromise(roomPlayersTester);
        const userId = parseInt(inputValue, 10);
        console.log("Room players:", roomPlayers);
        console.log("Input value in function:", inputValue);
        
        if (!userId) {
          setFeedbackMessage("User ID is required");
          return;
        }
        try {
          if (roomPlayers.length >= roomSize) {
            setFeedbackMessage("Room is full");
            return;
          }
          if (roomPlayers.includes(parseInt(inputValue, 10))) {
            setFeedbackMessage("User already in room");
            return;
          }
          setRoomPlayers((prevPlayersId) => [...prevPlayersId, userId]);
          setInputValue("");
          setFeedbackMessage(null);
          setOpen(false);
        } catch (error) {
          // Handle errors, you can set an error message in the feedback
          setFeedbackMessage("Error fetching user");
        }
      },
    [inputValue, roomSize, setRoomPlayers, setOpen]
  );

  return (
    <React.Fragment>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog>
          <DialogTitle>Add Friend</DialogTitle>
          <DialogContent>You can add a friend with their ID</DialogContent>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <FormControl color={feedbackMessage ? "danger" : "neutral"}>
                <FormLabel>User ID</FormLabel>
                <Input
                  type="number"
                  value={inputValue}
                  onChange={(e) => {
                    console.log("Input value:", e.target.value);
                    setInputValue(e.target.value);
                  }}
                  name="userId"
                  placeholder="User ID"
                  autoFocus
                />
                {feedbackMessage && (
                  <FormHelperText>{feedbackMessage}</FormHelperText>
                )}
              </FormControl>
              <Button type="submit">Invite User</Button>
            </Stack>
          </form>
        </ModalDialog>
      </Modal>
    </React.Fragment>
  );
}
