import { Typography } from "@mui/joy";

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

  
    export default LobbyGameTypography;