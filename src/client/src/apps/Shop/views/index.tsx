import { Modal, ModalDialog, Sheet, Typography } from "@mui/joy";
import ShopTabs from "../components/ShopTabs";
import { useOpenShopModal } from "../hooks/useOpenShopModal";

export default function ShopView() {
  const { close, isOpened, data } = useOpenShopModal();
  return (
    <Modal open={isOpened} onClose={close}>
      <ModalDialog
        sx={{
          width: "86dvh",
          height: "60dvh",
          borderLeft: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          p: 0
        }}
      >
        <ShopTabs></ShopTabs>
      </ModalDialog>
    </Modal>
  );
}
