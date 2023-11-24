import { useModal, useModalActions } from '@hooks/useModal';

export interface ImagePreviewState {
  src: string;
}

export const IMAGE_PREVIEW_ID = 'misc:image-preview';

export const useImagePreview = () =>
  useModal<ImagePreviewState>(IMAGE_PREVIEW_ID);

export const useImagePreviewActions = () =>
  useModalActions<ImagePreviewState>(IMAGE_PREVIEW_ID);
