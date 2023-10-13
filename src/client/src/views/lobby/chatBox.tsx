import { useKeybindsToggle } from "@hooks/keybinds";
import { Input, Typography } from "@mui/joy";
import { Box, Sheet } from "@mui/joy";
import React, { useRef, useState } from "react";
import { useLoggedInSession } from "@hooks/user";
import { Resizable } from "react-resizable";

interface ChatBoxProps {}

const ChatBox: React.FC<ChatBoxProps> = () => {
  const [inputMessage, setInputMessage] = useState("");
  const [focus, setFocus] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(300);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  const { user } = useLoggedInSession();
  const handleSendMessage = () => {
    if (inputMessage.trim() !== "") {
      const nickname = user.nickname;
      const message = `${nickname}: ${inputMessage}`;
      setMessages((prevMessages) => [...prevMessages, message]);
      setInputMessage("");
    }
  };

  React.useEffect(() => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, messagesRef]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const event = React.useCallback(
    (key: string, pressed: boolean, e: KeyboardEvent) => {
      if (!pressed) return;
      if (key === "Tab" && !focus) {
        setFocus(true);
        inputRef.current?.querySelector("input")?.focus();
        e.preventDefault();
      } else if (key === "Tab" && focus) {
        setFocus(false);
        inputRef.current?.querySelector("input")?.blur();
        e.preventDefault();
      }
    },
    [focus]
  );
  const onResize = (e: any, data: any) => {
    setWidth(data.size.width);
  };

  useKeybindsToggle(["Tab"], event, []);

  const listItemStyles = {
    padding: "10px",
    maxHeight: "200px",
    height: "25%",
    overflowY: "auto",
    bgcolor: "rgba(0, 0, 0, 0.3)",
    width: "100%",
  };

  //Rezise is not working
  return (
    <Resizable
      width={width}
      height={200}
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <Box
        sx={{
          maxWidth: "500px",
          width: "50%",
          margin: "auto",
          position: "absolute",
          bottom: "10px",
          left: "10px",
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
        }}
      >
        <Sheet sx={listItemStyles} ref={messagesRef}>
          {messages.map((message, index) => {
            const [nickname, ...rest] = message.split(":");
            return (
              <Box
                key={index}
                sx={{ display: "flex", bgcolor: "rgba(0, 0, 0, 0)" }}
              >
                <Typography sx={{ color: "green" }}>{nickname}</Typography>:
                <Typography>{rest.join(":")}</Typography>
              </Box>
            );
          })}
        </Sheet>
        <Sheet
          sx={{
            marginTop: "5px",
            display: "flex",
            bgcolor: "rgba(0, 0, 0, 0.3)",
            width: "100%",
          }}
        >
          <Input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            style={{
              flex: 1,
              padding: "5px",
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              width: "100%",
            }}
          />
        </Sheet>
      </Box>
    </Resizable>
  );
};

export default ChatBox;
