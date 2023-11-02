import useAppService from './service';

export default function StateMounter(): JSX.Element | null {
  useAppService();
  return null;
}
