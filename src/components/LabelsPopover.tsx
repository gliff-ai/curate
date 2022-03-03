import { useState, ReactElement, ChangeEvent } from "react";
import SVG from "react-inlinesvg";

import makeStyles from "@mui/styles/makeStyles";
import {
  InputBase,
  Chip,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Typography,
  IconButton,
  TextField,
} from "@mui/material";
import { theme, BasePopover, icons } from "@gliff-ai/style";
import { tooltips } from "./Tooltips";
import Autocomplete from "@mui/material/Autocomplete";

const useStyles = makeStyles({
  cross: {
    position: "absolute",
    right: "10px",
    color: theme.palette.text.primary,
  },
  addButton: { position: "absolute", right: "10px", top: "60px" },
  cardContent: {
    padding: "15px",
    paddingTop: "10px",
  },
  labelsCard: {
    borderRadius: "9px",
    backgroundColor: theme.palette.primary.light,
    width: "300px",
  },
  labelsCardHeader: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.text.primary,
    height: "44px",
  },
  cardHeaderTypography: {
    fontSize: "21px",
    width: "240px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  labelsChip: {
    margin: "5px 5px 0 0 ",
    borderRadius: "9px",
    color: theme.palette.text.secondary,
  },
  inputGrid: {
    width: "100%",
  },
  input: {
    fontSize: 14,
    width: "225px",
    marginBottom: "20px",
    borderBottom: "solid 1px #dadde9",
  },
  addLabelButton: {
    position: "absolute",
    bottom: theme.spacing(1),
    left: theme.spacing(2),
  },
  svgSmall: { width: "10px", height: "100%" },
  iconSize: { width: "15px" },
});

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
  const classes = useStyles();
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

  const popoverContent = (
    <Card className={classes.labelsCard}>
      <IconButton
        key={`button-close-${props.id}`}
        className={classes.cross}
        onClick={() => setClose((close) => close + 1)}
        size="large"
      >
        <SVG className={classes.iconSize} src={icons.removeLabel} />
      </IconButton>
      <CardHeader
        className={classes.labelsCardHeader}
        title={
          <Typography className={classes.cardHeaderTypography}>
            {props.imageName}
          </Typography>
        }
      />
      <CardContent className={classes.cardContent}>
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
                className={classes.input}
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
            inputProps={{
              className: classes.input,
            }}
            autoFocus
          />
        )}

        <IconButton
          aria-label="add-label"
          key={`button-add-${props.id}`}
          className={classes.addButton}
          onClick={handleAddLabel(newLabel)}
          size="large"
        >
          <SVG
            className={classes.iconSize}
            src={icons.add}
            fill={theme.palette.text.secondary}
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
                  className={classes.iconSize}
                  src={icons.removeLabel}
                  fill={theme.palette.text.secondary}
                />
              </Avatar>
            }
            className={classes.labelsChip}
            label={label}
            variant="outlined"
          />
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className={classes.addLabelButton}>
      <BasePopover
        tooltip={tooltips.addLabels}
        tooltipPlacement="top-start"
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
        children={popoverContent}
        triggerClosing={close}
        id="add-label"
      />
    </div>
  );
}
