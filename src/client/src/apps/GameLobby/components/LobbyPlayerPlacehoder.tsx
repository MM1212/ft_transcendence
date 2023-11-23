import { UserAvatar } from "@components/AvatarWithStatus";
import AccountPlusIcon from "@components/icons/AccountPlusIcon";
import { useUser } from "@hooks/user";
import { Box, Divider, IconButton } from "@mui/joy";
import { Typography } from "@mui/joy";
import { Stack } from "@mui/joy";

export default function LobbyPlayerPlaceholder({ id }: { id: number }) {
  //Lets create a login that verifys if the id is zero, if zero user is undefined and if not zero user is defined
  //   const [user, setUser] = useState<UsersModel.Models.IUser | null>(null);
  //   function YourComponent({ id }: { id: number }) {
  //     useEffect(() => {
  //       // Fetch user data based on the provided id
  //       const fetchUser = async () => {
  //         try {
  //           const response = await fetch(`/api/users/${id}`);
  //           const data = await response.json();
  //           setUser(data);
  //         } catch (error) {
  //           console.error("Failed to fetch user data:", error);
  //         }
  //       };
  //       fetchUser();
  //     }, [id]);
  //   }
  const user = useUser(id);
  if (user === null) return;
  return (
    <>
      <Divider />
      <Stack display="flex" flexDirection="row" sx={{ pt: "5px", pb: "5px" }}>
        <UserAvatar src={user?.avatar} sx={{ width: "80px", height: "80px" }} />
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          sx={{ pl: "20px" }}
        >
          <Typography level="body-lg">{user?.nickname}</Typography>
          <Typography level="body-sm">Rank Placeholder</Typography>
        </Box>
        <IconButton size="lg" sx={{ marginLeft: "auto" }}>
          <AccountPlusIcon />
        </IconButton>
      </Stack>
      <Divider />
    </>
  );
}
