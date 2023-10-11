import { Box, Button, Sheet } from "@mui/joy";
import React, { useState } from "react";

interface ChatBoxProps {
	//Be 50 % transparent and have a bege, very light background
}

const ChatBox: React.FC<ChatBoxProps> = () => {
	const [inputMessage, setInputMessage] = useState('');
	const [messages, setMessages] = useState<string[]>([]);
  
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
	  setInputMessage(e.target.value);
	};
  
	const handleSendMessage = () => {
	  if (inputMessage.trim() !== '') {
		setMessages((prevMessages) => [...prevMessages, inputMessage]);
		setInputMessage('');
	  }
	};
  
	return (
	  <Box  sx={{ maxWidth: '400px', margin: 'auto', position: "absolute", bottom: "10px", left: "10px" }}>
		<Sheet sx={{ border: '1px solid #ccc', padding: '10px', maxHeight: '300px', overflowY: 'auto' }}>
		  {messages.map((message, index) => (
			<Sheet key={index}>{message}</Sheet>
		  ))}
		</Sheet>
		<Sheet sx={{ marginTop: '10px', display: 'flex' }}>
		  <input
			type="text"
			value={inputMessage}
			onChange={handleInputChange}
			style={{ flex: 1, marginRight: '10px', padding: '5px' }}
		  />
		  <Button onClick={handleSendMessage}></Button>
		</Sheet>
	  </Box>
	);
  };
  
  export default ChatBox;