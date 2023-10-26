import * as React from "react";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import FormControl from "@mui/joy/FormControl";
import Textarea from "@mui/joy/Textarea";
import { IconButton, Stack } from "@mui/joy";
import { ChatModel } from "@typings/models";

export type MessageInputProps = {
  chatMessages: ChatModel.Models.IChatMessage[];
  setChatMessages: (newMessage: ChatModel.Models.IChatMessage) => void;
};

export default function MessageInput({
  chatMessages,
  setChatMessages,
}: MessageInputProps) {
  const [textAreaValue, setTextAreaValue] = React.useState("");

  //const textAreaRef = React.useRef<HTMLDivElement>(null);
  const handleClick = () => {
    setTextAreaValue("");
    if (textAreaValue.trim() === "") return;
    const newMessage = {
      id: chatMessages[chatMessages.length - 1].id + 1,
      chatId: chatMessages[0].chatId + 1,
      type: chatMessages[0].type,
      message: textAreaValue,
      meta: {},
      author: chatMessages[0].author,
      authorId: chatMessages[0].authorId,
      createdAt: 21341234,
	  timestamp: new Date(),
    };
    setChatMessages(newMessage);
    //TODO: handle new message: send to db
  };

  return (
    <Box sx={{ px: 2, pb: 3 }}>
      <FormControl>
        <Textarea
          placeholder="Type something here…"
          aria-label="Message"
          onChange={(e) => {
            setTextAreaValue(e.target.value);
          }}
          value={textAreaValue}
          minRows={3}
          maxRows={10}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.stopPropagation();
              event.preventDefault();
              handleClick();
            }
          }}
          endDecorator={
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              flexGrow={1}
              sx={{
                py: 1,
                pr: 1,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <div>
                <IconButton
                  size="sm"
                  variant="plain"
                  color="neutral"
                ></IconButton>
                <IconButton
                  size="sm"
                  variant="plain"
                  color="neutral"
                ></IconButton>
                <IconButton
                  size="sm"
                  variant="plain"
                  color="neutral"
                ></IconButton>
                <IconButton
                  size="sm"
                  variant="plain"
                  color="neutral"
                ></IconButton>
              </div>
              <Button
                size="sm"
                color="primary"
                sx={{ alignSelf: "center", borderRadius: "sm" }}
                onClick={handleClick}
                type="submit"
              >
                Send
              </Button>
            </Stack>
          }
          sx={{
            "& textarea:first-of-type": {
              minHeight: 72,
            },
          }}
        />
      </FormControl>
    </Box>
  );
}
