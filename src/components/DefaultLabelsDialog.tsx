import { useEffect, useState } from "react";
import {
  Paper,
  Card,
  Dialog,
  Typography,
  makeStyles,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  IconButton,
  Button,
} from "@material-ui/core";
import { BaseIconButton, BaseTextButton, theme, icons } from "@gliff-ai/style";
import { tooltips } from "./Tooltips";

interface Props {}

export function DefaultLabelsDialog(props: Props): React.ReactElement {
  const [open, setOpen] = useState<boolean>(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <BaseIconButton
        tooltip={tooltips.defaultLabels}
        onClick={() => {
          setOpen(!open);
        }}
        tooltipPlacement="top"
        id="set-default-labels"
      />
      <Dialog open={open} onClose={handleClose}></Dialog>
    </>
  );
}
