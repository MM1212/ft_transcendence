import * as React from "react";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import FormControl from "@mui/joy/FormControl";
import Textarea from "@mui/joy/Textarea";
import { IconButton, Stack } from "@mui/joy";

export type MessageInputProps = {
  textAreaValue: string;
  setTextAreaValue: (value: string) => void;
  // onSubmit: () => void;
};

export default function MessageInput()
{
  const [textAreaValue, setTextAreaValue] = React.useState("");

  //const textAreaRef = React.useRef<HTMLDivElement>(null);
  const handleClick = () => {
    setTextAreaValue("");
    console.log("textAreaValue: ", textAreaValue);
    //TODO: handle new message: show and send to db
    // if (textAreaValue.trim() !== "") {
    //   // onSubmit();
    //   setTextAreaValue("");
    // }
  };
  
  return (
    <Box sx={{ px: 2, pb: 3 }}>
      <FormControl>
        <Textarea
          placeholder="Type something here…"
          aria-label="Message"
          //ref={textAreaRef}
          onChange={(e) => {
            setTextAreaValue(e.target.value);
          }}
          value={textAreaValue}
          minRows={3}
          maxRows={10}
          onKeyDown={(event) => {
            if (event.key === "Enter" && event.shiftKey) {
              event.stopPropagation();
              event.preventDefault();
              console.log("Enter key pressed");
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
