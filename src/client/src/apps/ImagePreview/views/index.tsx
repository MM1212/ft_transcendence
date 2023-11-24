import { Modal, Stack, Typography } from '@mui/joy';
import { useImagePreview } from '../hooks';
import Fade from '@components/transitions/Fade';

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
      <Fade opened={isOpened}>
        <img
          src={data.src}
          style={{
            maxHeight: '90dvh',
            maxWidth: '90dvw',
            objectFit: 'scale-down',
          }}
        />
      </Fade>
    </Modal>
  );
}
