import { Button, Typography, listItemClasses } from "@mui/joy";
import clsx from "clsx";
import {  useRoute } from "wouter";

export default function FriendsOnline() {
  const [selected] = useRoute("/online");
  console.log(selected);

  return (
    <>
      <Button
        component="div"
        variant="soft"
        color="neutral"
        className={clsx(listItemClasses.root, {
          "Mui-selected": selected,
        })}
      >
        <Typography>Online</Typography>
      </Button>
    </>
  );
}
