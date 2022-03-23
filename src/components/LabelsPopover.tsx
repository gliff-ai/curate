import { useState, ReactElement, ChangeEvent } from "react";
import SVG from "react-inlinesvg";

import {
  theme,
  Dialog,
  icons,
  InputBase,
  Chip,
  Autocomplete,
  Avatar,
  TextField,
  IconButton,
} from "@gliff-ai/style";
import { tooltips } from "./Tooltips";

interface Props {
  id: string;
  labels: string[];
  defaultLabels: string[];
  restrictLabels: boolean;
  multiLabel: boolean;
  imageName: string;
  updateLabels: (newLables: string[]) => void;
}

export function LabelsPopover(props: Props): ReactElement {
  const [newLabel, setNewLabel] = useState("");
  const [close, setClose] = useState(0);

  const handleNewLabelChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewLabel(event.target.value);
  };

  const handleDeleteLabel = (label: string) => (): void => {
    const oldLabels: string[] = props.labels;
    oldLabels.splice(oldLabels.indexOf(label), 1);
    props.updateLabels(oldLabels);
  };

  const handleAddLabel = (label: string) => (): void => {
    if (
      props.labels.includes(label) ||
      label === "" ||
      (!props.multiLabel && props.labels.length > 0)
    )
      return;
    const oldLabels: string[] = props.labels;
    oldLabels.push(label);
    props.updateLabels(oldLabels);
    setNewLabel("");
  };

  return (
    <Dialog
      title="Labels Popover"
      TriggerButton={<IconButton tooltip={tooltips.addLabels} size="medium" />}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      fill={true}
      iconColor="#ffffff"
      triggerClosing={close}
      id="add-label"
      style={{
        position: "absolute",
        bottom: theme.spacing(1),
        left: theme.spacing(2),
      }}
    >
      <div style={{ display: "table-caption" }}>
        {props.defaultLabels.length > 0 ? (
          <Autocomplete
            onChange={(event, value) => {
              setNewLabel(value);
            }}
            onInputChange={(event, value) => {
              if (!props.restrictLabels) {
                setNewLabel(value);
              }
            }}
            style={{ width: "300px" }}
            options={props.defaultLabels}
            freeSolo={!props.restrictLabels}
            value={newLabel}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Label"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddLabel(newLabel)();
                  }
                }}
                autoFocus
                style={{
                  fontSize: 14,
                  width: "225px",
                  marginBottom: "20px",
                  borderBottom: "solid 1px #dadde9",
                }}
              />
            )}
          />
        ) : (
          <InputBase
            key={`input-${props.id}`}
            placeholder="New label"
            type="text"
            value={newLabel}
            onChange={handleNewLabelChange}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleAddLabel(newLabel)();
              }
            }}
            size="small"
            autoFocus
          />
        )}

        <IconButton
          aria-label="add-label"
          key={`button-add-${props.id}`}
          onClick={handleAddLabel(newLabel)}
          size="large"
          style={{ position: "absolute", right: "10px", top: "70px" }}
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
      </div>
    </Dialog>
  );
}
