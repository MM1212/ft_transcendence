import { Modal } from '@mui/joy';
import { useImagePreview } from '../hooks';
import Grow from '@components/transitions/Grow';

export default function ImagePreviewView(): JSX.Element {
  const { close, data, isOpened } = useImagePreview();

  return (
    <Modal
      open={isOpened}
      onClose={close}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      keepMounted
    >
      <Grow opened={isOpened} from={data.from}>
        <img
          src={data.src}
          style={{
            maxHeight: '90dvh',
            maxWidth: '90dvw',
            objectFit: 'scale-down',
          }}
        />
      </Grow>
    </Modal>
  );
}
