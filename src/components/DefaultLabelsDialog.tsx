import { useState, ChangeEvent } from "react";
import { IconButton } from "@mui/material"; // TODO import from STYLE
import SVG from "react-inlinesvg";
import {
  BaseIconButton,
  BaseTextButton,
  theme,
  icons,
  Chip,
  FormControlLabel,
  Checkbox,
  Dialog,
  InputBase,
  Avatar,
  GliffCard,
} from "@gliff-ai/style";
import { tooltips } from "./Tooltips";

interface Props {
  labels: string[];
  restrictLabels: boolean;
  multiLabel: boolean;
  updateDefaultLabels: (
    labels: string[],
    restrictLabels: boolean,
    multiLabel: boolean,
    sync: boolean
  ) => void;
}

export function DefaultLabelsDialog(props: Props): React.ReactElement {
  const classes = useStyles();
  const [open, setOpen] = useState<boolean>(false);
  const [inputString, setInputString] = useState<string>("");
  const [oldLabels, setOldLabels] = useState<string[]>([]);
  const [oldRestrictLabels, setOldRestrictLabels] = useState<boolean>(false);
  const [oldMultiLabel, setOldMultiLabel] = useState<boolean>(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleNewLabelChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputString(event.target.value);
  };

  const handleAddLabel = (label: string) => (): void => {
    if (props.labels.includes(label)) return;
    props.updateDefaultLabels(
      props.labels.concat([label]),
      props.restrictLabels,
      props.multiLabel,
      false
    );
    setInputString("");
  };

  const handleDeleteLabel = (label: string) => (): void => {
    const oldLabels: string[] = props.labels;
    oldLabels.splice(oldLabels.indexOf(label), 1);
    props.updateDefaultLabels(
      oldLabels,
      props.restrictLabels,
      props.multiLabel,
      false
    );
  };

  return (
    <>
      <BaseIconButton
        tooltip={tooltips.defaultLabels}
        onClick={() => {
          setOpen(!open);
          // remember the original defaultLabels so we can revert if user hits Cancel:
          setOldLabels(props.labels);
          setOldRestrictLabels(props.restrictLabels);
          setOldMultiLabel(props.multiLabel);
        }}
        tooltipPlacement="top"
        id="set-default-labels"
      />
      <Dialog open={open} onClose={handleClose}>
        <GliffCard
          title="Set default labels"
          el={
            <div
              style={{
                width: "400px",
                padding: "17px",
                paddingTop: "10px",
              }}
            >
              <InputBase
                key="input-new-default-label"
                placeholder="New label"
                type="text"
                value={inputString}
                onChange={handleNewLabelChange}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddLabel(inputString)();
                  }
                }}
                size="small"
                autoFocus
              />
              <IconButton
                aria-label="add-label"
                key="button-add-default-label"
                style={{ position: "absolute", right: "10px" }}
                onClick={handleAddLabel(inputString)}
              >
                <SVG
                  src={icons.add}
                  fill={theme.palette.text.secondary}
                  width="15px"
                />
              </IconButton>
              {props.labels.map((label) => (
                <Chip
                  key={`chip-add-${label}`}
                  avatar={
                    <Avatar
                      variant="circular"
                      style={{ cursor: "pointer" }}
                      onClick={handleDeleteLabel(label)}
                      data-testid={`delete-${label}`}
                    >
                      <SVG
                        width="15px"
                        src={icons.removeLabel}
                        fill={theme.palette.text.secondary}
                      />
                    </Avatar>
                  }
                  label={label}
                  variant="outlined"
                />
              ))}

              <FormControlLabel
                control={
                  <Checkbox
                    checked={props.restrictLabels}
                    onChange={(event) => {
                      props.updateDefaultLabels(
                        props.labels,
                        !props.restrictLabels,
                        props.multiLabel,
                        false
                      );
                    }}
                  />
                }
                label="Restrict collaborators to these labels"
                style={{ marginTop: "8px" }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={props.multiLabel}
                    onChange={(event) => {
                      props.updateDefaultLabels(
                        props.labels,
                        props.restrictLabels,
                        !props.multiLabel,
                        false
                      );
                    }}
                  />
                }
                label="Allow multiple labels per image"
                style={{ marginTop: "8px" }}
              />
              <div
                style={{
                  display: "flex",
                  marginTop: "20px",
                  justifyContent: "space-between",
                }}
              >
                <BaseTextButton
                  id="cancel-default=labels"
                  text="Cancel"
                  onClick={() => {
                    props.updateDefaultLabels(
                      oldLabels,
                      oldRestrictLabels,
                      oldMultiLabel,
                      false
                    );
                    handleClose();
                  }}
                  variant="outlined"
                />
                <BaseTextButton
                  id="confirm-default-labels"
                  text="Confirm"
                  onClick={() => {
                    props.updateDefaultLabels(
                      props.labels,
                      props.restrictLabels,
                      props.multiLabel,
                      true
                    );
                    handleClose();
                  }}
                />
              </div>
            </div>
          }
        />
      </Dialog>
    </>
  );
}
