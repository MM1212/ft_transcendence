import { Typography } from "@mui/joy";
import { Box, Sheet } from "@mui/joy";
import React, { useEffect, useRef, useState } from "react";

interface ChatBoxProps {}

const ChatBox: React.FC<ChatBoxProps> = () => {
  const [inputMessage, setInputMessage] = useState("");
  const [focus, setFocus] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() !== "") {
      setMessages((prevMessages) => [...prevMessages, inputMessage]);
      setInputMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  useEffect(() => {
    const event = (e: KeyboardEvent) => {
      if (e.key === "Tab" && !focus) {
        setFocus(true);
        inputRef.current?.focus();
        e.preventDefault();
      } else if (e.key === "Tab" && focus) {
        setFocus(false);
        inputRef.current?.blur();
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", event);
    return () => {
      window.removeEventListener("keydown", event);
    };
  }, [focus]);

  return (
    <Box
      sx={{
        maxWidth: "500px",
        margin: "auto",
        position: "absolute",
        bottom: "10px",
        left: "10px",
      }}
    >
      <Sheet
        sx={{
          padding: "10px",
          maxHeight: "100px",
          overflowY: "auto",
          bgcolor: "rgba(0, 0, 0, 0.3)",
          width: "100%",
        }}
      >
        {messages.map((message, index) => (
          <Typography key={index}>{message}</Typography>

        ))}
      </Sheet>
      <Sheet
        sx={{
          marginTop: "5px",
          display: "flex",
          bgcolor: "rgba(0, 0, 0, 0.3)",
          width: "100%",
        }}
      >
        {/* Can't use Input element*/}
        <input
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
  );
};

export default ChatBox;
