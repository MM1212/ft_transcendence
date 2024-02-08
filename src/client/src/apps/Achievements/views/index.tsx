import { Sheet, Stack } from "@mui/joy";
import AchievementHead from "../components/AchievementHead";
import AchievementLogo from "../components/AchievementLogo";
import IetiBadgeAchievment from "../assets/IetiBadgeAchievment.jpg";
import OctopBadgeAchievement from "../assets/OctopBadgeAchievement.jpg";
import DragonBossConvers from "../assets/DragonBossConvers.jpg";
import RedBadge from "../assets/RedBadge.jpg";

export default function AchievementsPanel() {
  const myAchievements: string[] = [
    IetiBadgeAchievment,
    OctopBadgeAchievement,
    RedBadge,
    DragonBossConvers,
    IetiBadgeAchievment,
    OctopBadgeAchievement,
    RedBadge,
    DragonBossConvers,
    IetiBadgeAchievment,
    OctopBadgeAchievement,
  ];
  const myAchivDescription: string[] = [
    "Win a match without letting the opponent score a single point.",
    "Win a match within 30 seconds.",
    "Win a match against an opponent with a significantly higher level or ranking.",
    "Win a match without using any power-ups.",
    "Unlock and equip a rare paddle skin.",
    "Achieve a win streak of 10 matches.",
    "Achieve the highest ranking in online multiplayer mode.",
    "Purchase all available assets from the in-game shop, indicating your dedication to customizing and enhancing your Pong experience to the fullest.",
    "Win a doubles match with a perfect score",
    "Win 50 matches against different opponents.",
  ];
  const myAchivTitle: string[] = [
    "Unstopable Force.",
    "Speed Demon.",
    "Underdog Victory.",
    "Master Strategist",
    "Golden Paddle",
    "Pong Savant",
    "Pong Legend",
    "Shopaholic",
    "Team Player",
    "Legendary Duelist",
  ];

  return (
    <Sheet
      sx={{
        width: "80dvh",
        height: "100%",
        borderLeft: "1px solid",
        borderColor: "divider",
      }}
    >
      <AchievementHead myAchievements={myAchievements} />
      <Stack
        direction="column"
        sx={{
          width: "100%",
          height: "80%",
        }}
        overflow="auto"
      >
        <AchievementLogo
          myAchievements={myAchievements}
          myAchivDescription={myAchivDescription}
          myAchivTitle={myAchivTitle}
        />
      </Stack>
    </Sheet>
  );
}
