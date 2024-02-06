import { Sheet, Box, Typography } from "@mui/joy";
import { Link } from "wouter";

export default function GenericPlaceholder({
    title,
    label,
    icon,
    path,
  }: {
    title: string;
    label?: string;
    icon: React.ReactNode;
    path?: string;
  }) {
    return (
        <Sheet variant="outlined" sx={{ width:'60%', borderRadius: 'sm', maxWidth:'80%'}}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={1}
          p={4}
        >
        {icon}
          <Typography level="body-md">{title}</Typography>
          <Typography
            component={Link}
            to={path}
            level="body-xs"
          >
            {label}
          </Typography>
        </Box>
      </Sheet>
    )
}