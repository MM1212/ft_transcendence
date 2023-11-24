import {
  Avatar,
  Button,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Option,
  RadioGroup,
  Select,
  Sheet,
} from "@mui/joy";
import { Stack } from "@mui/joy";
import React from "react";
import LobbyPlayerBanner from "./LobbyPlayerBanner";
import LabelIcon from "@components/icons/LabelIcon";
import { Typography } from "@mui/joy";
import { Box } from "@mui/joy";
import { Radio } from "@mui/joy";
import LobbyRoom from "./LobbyRoom";

export interface LobbyGameTypographyProps {
  label: string;
  level:  "body-md" | "body-lg" | "body-sm" | "title-md" | "title-lg" | "title-xl"; 
}

const LobbyGameTypography: React.FC<LobbyGameTypographyProps> = ({ label, level }) => {
  return (
    <Typography level={level} variant="outlined" color="warning" sx={{ border: "unset" }}>
      {label}
    </Typography>
  );
};

export default function LobbyCreateCustom() {
  // Create a logic that first inputs the user to create a costum or to join an existing room
  const [name, setName] = React.useState<string>("");
  const [teamSize, setTeamSize] = React.useState<string | null>("2");
  const [password, setPassword] = React.useState<string>("");
  const [spectators, setSpectators] = React.useState<string>("all");
  const [errors, setErrors] = React.useState({
    name: "",
  });
  const [isCustom, setIsCustom] = React.useState(false);
  const validateForm = () => {
    const newErrors = {
      name: name.trim() === "" ? "Name is required" : "",
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleCreateRoom = () => {
    if (validateForm()) {
      setIsCustom(true);
    }
  };
  return (
    <Sheet
      sx={{
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: "unset",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {!isCustom ? (
        <>
          <LobbyPlayerBanner />
          <Divider sx={{ mt: 4 }} />
          <Box sx={{ width: "100%", display: "flex", flexDirection: "row" }}>
            <Stack spacing={2} sx={{ display: "flex", mt: 5 }}>
              <FormControl>
                <FormLabel required>
                  <LobbyGameTypography label="Name" level='body-sm' />
                </FormLabel>
                <Input
                  color={errors.name ? "danger" : "warning"}
                  required
                  placeholder="Enter room name"
                  startDecorator={<LabelIcon />}
                  endDecorator={<Typography level="body-sm"></Typography>}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && <FormHelperText>{errors.name}</FormHelperText>}{" "}
              </FormControl>
              <FormControl required>
                <FormLabel> <LobbyGameTypography label="Team Size" level='body-sm' /></FormLabel>
                <Select
                  variant="soft"
                  color="warning"
                  defaultValue="2"
                  onChange={(e, value) => setTeamSize(value)}
                  value={teamSize}
                >
                  <Option value="2">2</Option>
                  <Option value="4">4</Option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>
                <LobbyGameTypography label="Password (optional)" level='body-sm' />
                </FormLabel>
                <Input
                  placeholder="Enter Password"
                  color="warning"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>
            </Stack>
            <Stack
              sx={{
                alignItems: "center",
                width: "100%",
                display: "flex",
                mt: 5,
                flexDirection: "column",
              }}
            >
              <FormControl
                sx={{ mt: 2, display: "flex", flexDirection: "column" }}
              >
                <FormLabel> <LobbyGameTypography label="ALLOW SPECTATORS" level='body-md' /></FormLabel>
                <RadioGroup defaultValue="all" name="Spectator-Radio">
                  <Stack spacing={5} sx={{ mt: 2 }}>
                    <Radio
                      value="all"
                      size="sm"
                      label="All"
                      defaultChecked
                      onChange={() => setSpectators("all")}
                    />
                    <Radio
                      value="friends"
                      size="sm"
                      label="Friends Only"
                      onChange={() => setSpectators("friends")}
                    />
                    <Radio
                      value="none"
                      size="sm"
                      label="None"
                      onChange={() => setSpectators("none")}
                    />
                  </Stack>
                </RadioGroup>
              </FormControl>
            </Stack>
          </Box>
          <Button
            sx={{ width: "25%", mt: 5 }}
            type="submit"
            variant="outlined"
            onClick={handleCreateRoom}
          >
            Create
          </Button>
        </>
      ) : (
        <LobbyRoom
          name={name}
          password={password}
          teamSize={teamSize}
          spectator={spectators}
        />
      )}
    </Sheet>
  );
}
