import { useState, ChangeEvent } from "react";
import {
  Card,
  Dialog,
  Typography,
  IconButton,
  InputBase,
  Chip,
  Avatar,
  CardHeader,
  CardContent,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import SVG from "react-inlinesvg";
import { BaseIconButton, BaseTextButton, theme, icons } from "@gliff-ai/style";
import { tooltips } from "./Tooltips";

const useStyles = makeStyles({
  container: {
    textAlign: "center",
    marginTop: "20px",
    display: "flex",
    justifyContent: "space-around",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    width: "auto",
    hegith: "400px",
  },
  typography: {
    color: "#000000",
    display: "inline",
    fontSize: "21px",
    marginRight: "125px",
  },
  alert: {
    width: "auto",
  },
  contentContainer: { padding: "10px" },
  closeButton: {
    position: "absolute",
    top: "7px",
    right: "10px",
  },
  closeIcon: { width: "15px" },
  okButton: { position: "absolute", right: "10px", top: "75px" },
  input: {
    fontSize: 14,
    width: "325px",
    marginBottom: "20px",
    borderBottom: "solid 1px #dadde9",
  },
  addLabelButton: {
    position: "absolute",
    bottom: theme.spacing(1),
    left: theme.spacing(2),
  },
  addButton: { position: "absolute", right: "10px" },
  iconSize: { width: "15px" },
  labelsChip: {
    margin: "5px 5px 0 0 ",
    borderRadius: "9px",
    color: theme.palette.text.secondary,
  },
  cardContent: {
    padding: "15px",
    paddingTop: "10px",
  },
  labelsCard: {
    borderRadius: "9px",
    backgroundColor: theme.palette.primary.light,
    width: "400px",
  },
  labelsCardHeader: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.text.primary,
    height: "44px",
  },
  dialogPaper: {
    borderRadius: "9px",
  },
});

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
      <Dialog
        open={open}
        onClose={handleClose}
        classes={{ paper: classes.dialogPaper }}
      >
        <Card className={classes.labelsCard}>
          <CardHeader
            className={classes.labelsCardHeader}
            title={
              <Typography className={classes.typography}>
                Set default labels
              </Typography>
            }
          />
          <IconButton className={classes.closeButton} onClick={handleClose}>
            <SVG src={icons.removeLabel} className={classes.closeIcon} />
          </IconButton>
          <CardContent className={classes.cardContent}>
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
              inputProps={{
                className: classes.input,
              }}
              autoFocus
            />
            <IconButton
              aria-label="add-label"
              key={"button-add-default-label"}
              className={classes.addButton}
              onClick={handleAddLabel(inputString)}
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
            <div className={classes.container}>
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
              />
            </div>
          </CardContent>
        </Card>
      </Dialog>
    </>
  );
}
