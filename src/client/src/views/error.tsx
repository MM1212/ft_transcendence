import useQuery from '@hooks/useQuery';
import { Container, Typography } from '@mui/joy';

export default function ErrorPage() {
  const { t } = useQuery<{ t: string }>();

  return (
    <Container>
      <Typography level="h1">{t}</Typography>
    </Container>
  );
}
