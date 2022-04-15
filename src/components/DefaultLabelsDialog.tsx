import { useState, ChangeEvent } from "react";
import {
  InputBase,
  Chip,
  Avatar,
  CardContent,
  Checkbox,
  FormControlLabel,
  Box,
} from "@mui/material";
import SVG from "react-inlinesvg";
import {
  BaseTextButton,
  theme,
  icons,
  Dialog,
  IconButton,
  MuiIconbutton,
} from "@gliff-ai/style";

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
      <Dialog
        title="Set default labels"
        TriggerButton={
          <IconButton
            tooltip={{
              name: "Open Dialog",
            }}
            icon={icons.annotationLabel}
            size="small"
            id="set-default-labels"
            onClick={() => {
              setOldLabels(props.labels);
              setOldRestrictLabels(props.restrictLabels);
              setOldMultiLabel(props.multiLabel);
            }}
          />
        }
      >
        <Box sx={{ width: "400px" }}>
          <CardContent>
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
            <MuiIconbutton
              aria-label="add-label"
              key={"button-add-default-label"}
              // className={classes.addButton}
              onClick={handleAddLabel(inputString)}
            >
              <SVG
                width="15px"
                src={icons.add}
                fill={theme.palette.text.secondary}
              />
            </MuiIconbutton>
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
              sx={{ marginTop: "8px" }}
            />
            <Box
              sx={{
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
            </Box>
          </CardContent>
        </Box>
      </Dialog>
    </>
  );
}
