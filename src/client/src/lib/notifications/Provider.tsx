import { GlobalStyles } from '@mui/joy';
import { Toaster } from 'sonner';

export default function NotificationsProvider(): JSX.Element {
  return (
    <Toaster position="top-right" richColors closeButton visibleToasts={5} />
  );
}
