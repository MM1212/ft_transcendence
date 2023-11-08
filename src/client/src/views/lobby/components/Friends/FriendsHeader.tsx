import { Divider, Tabs, Typography, tabClasses } from "@mui/joy";
import { Stack } from "@mui/joy";
import { TabList } from "@mui/joy";
import Link from "@components/Link";
import { Tab } from "@mui/joy";
import { useLocation } from "wouter";
import AddFriend from "./FriendsAddFriend";

const tabs = [
  {
    label: "Online",
    target: "/",
  },
  {
    label: "All",
    target: "/all",
  },
  {
    label: "Pending",
    target: "/pending",
  },
  {
    label: "Blocked",
    target: "/blocked",
  },
];

export default function FriendsHeader() {
  const [location] = useLocation();
  console.log(location);

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        py={{ xs: 2, md: 2 }}
        px={{ xs: 3, md: 2 }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography level="h4">Friends</Typography>
          <Divider orientation="vertical" />
          <Tabs
            value={location}
            sx={{
              backgroundColor: "transparent",
            }}
          >
            <TabList
              disableUnderline
              sx={{
                p: 1,
                pl: 0,
                backgroundColor: "transparent",
                gap: (theme) => theme.spacing(2),
                [`& .${tabClasses.root}`]: {
                  borderRadius: (theme) => theme.radius.sm,
                  fontSize: "md",
                  transition: (theme) =>
                    theme.transitions.create("background-color", {
                      duration: theme.transitions.duration.shortest,
                    }),
                  ["&:hover"]: {},
                },
              }}
            >
              {tabs.map((tab) => (
                <Tab
                  variant="soft"
                  color="neutral"
                  disableIndicator
                  key={tab.target}
                  component={Link}
                  to={tab.target}
                  value={tab.target}
                >
                  {tab.label}
                </Tab>
              ))}
            </TabList>
          </Tabs>
        </Stack>
        <AddFriend />
      </Stack>
    </>
  );
}