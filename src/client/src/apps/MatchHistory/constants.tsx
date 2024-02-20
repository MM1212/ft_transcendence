import CurrencyTwdIcon from '@components/icons/CurrencyTwdIcon';
import FireIcon from '@components/icons/FireIcon';
import PodiumIcon from '@components/icons/PodiumIcon';
import ShimmerIcon from '@components/icons/ShimmerIcon';
import SoccerIcon from '@components/icons/SoccerIcon';
import StarFourPointsIcon from '@components/icons/StarFourPointsIcon';
import WallIcon from '@components/icons/WallIcon';
import type PongHistoryModel from '@typings/models/pong/history';

export const statsMapping: {
  label: string;
  icon: JSX.Element;
  statKey: keyof PongHistoryModel.Models.PlayerStats;
}[] = [
  {
    label: 'Bounces on your paddle',
    icon: <WallIcon />,
    statKey: 'ballBounces',
  },
  { label: 'Mana Spent', icon: <ShimmerIcon />, statKey: 'manaSpent' },
  { label: 'Special Power Used', icon: <FireIcon />, statKey: 'shotsFired' },
  { label: 'Goals Scored', icon: <SoccerIcon />, statKey: 'goalsScored' },
  {
    label: 'Credits Earned',
    icon: <CurrencyTwdIcon />,
    statKey: 'moneyEarned',
  },
  {
    label: 'Player Score',
    icon: <StarFourPointsIcon />,
    statKey: 'playerScore',
  },
  {
    label: 'Elo Earned',
    icon: <PodiumIcon />,
    statKey: 'elo',
  }
];
