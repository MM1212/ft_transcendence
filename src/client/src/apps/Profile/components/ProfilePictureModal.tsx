import * as React from "react";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import ModalClose from "@mui/joy/ModalClose";
import DialogTitle from "@mui/joy/DialogTitle";
import Stack from "@mui/joy/Stack";
import CustomizationBox from "@apps/Customization/components/CustomizationBox";

export default function DialogVerticalScroll({
  setOpen,
  open,
}: {
  setOpen: (value: boolean) => void;
  open: boolean;
}) {
  const assetArray = [];

  for (let i = 1; i < 43; i++) {
    const assetPath = `/profile/tile${i.toString().padStart(4, "0")}.png`;
    assetArray.push(assetPath);
  }

  return (
    <React.Fragment>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog>
          <ModalClose />
          <DialogTitle>Vertical scroll example</DialogTitle>
          <Stack
            direction="row"
            sx={{
              display: "flex",
              width: "100%",
              flexWrap: "wrap",
              overflowY: "auto",
            }}
          >
            {assetArray.map((asset, index) => (
              <CustomizationBox
                key={index}
                clicable={true}
                imageUrl={asset}
                getPiece={true}
              />
            ))}
          </Stack>
        </ModalDialog>
      </Modal>
    </React.Fragment>
  );
}
