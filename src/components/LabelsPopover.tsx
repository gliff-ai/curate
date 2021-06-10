import React, { useState } from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import {
  InputBase,
  IconButton,
  Tooltip,
  Chip,
  Popover,
  Card,
  Grid,
  CardHeader,
  CardContent,
} from "@material-ui/core";
import { AddCircleOutline, Close, Add } from "@material-ui/icons";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    cross: {
      position: "absolute",
      top: theme.spacing(1),
      right: theme.spacing(1),
      color: "#ffffff",
    },
    labelsCard: {
      borderRadius: 5,
    },
    labelsCardHeader: {
      backgroundColor: theme.palette.primary.light,
      color: "#ffffff",
      fontSize: 14,
    },
    labelsGrid: {
      width: 300,
      height: "auto",
    },
    labelsChip: {
      margin: 5,
    },
    inputGrid: { width: "100%" },
    input: {
      borderBottom: `1px solid ${theme.palette.primary.dark}`,
      color: theme.palette.primary.dark,
      fontSize: 14,
    },
    addLabelButton: {
      color: theme.palette.primary.dark,
      position: "absolute",
      bottom: theme.spacing(1),
      right: theme.spacing(1),
    },
  })
);

interface Props {
  id: string;
  labels: string[];
  imageName: string;
  updateLabels: (newLables: string[]) => void;
}

export function LabelsPopover(props: Props) {
  const styles = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [newLabel, setNewLabel] = useState("");

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleNewLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewLabel(event.target.value);
  };

  const handleDeleteLabel = (label: string) => (): void => {
    const oldLabels: string[] = props.labels;
    oldLabels.splice(oldLabels.indexOf(label), 1);
    props.updateLabels(oldLabels);
  };

  const handleAddLabel = (label: string) => (): void => {
    if (props.labels.includes(label)) return;
    const oldLabels: string[] = props.labels;
    oldLabels.push(label);
    props.updateLabels(oldLabels);
    setNewLabel("");
  };

  const open = Boolean(anchorEl);
  const id = open ? props.id : undefined;

  return (
    <>
      <Tooltip title="Update image labels" aria-label="label-image">
        <IconButton
          aria-describedby={props.id}
          onClick={handleClick}
          className={styles.addLabelButton}
        >
          <AddCircleOutline />
        </IconButton>
      </Tooltip>
      <Popover
        key={`popover-${props.id}`}
        id={props.id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Card className={styles.labelsCard}>
          <IconButton
            key={`button-close-${props.id}`}
            className={styles.cross}
            onClick={handleClose}
            color="primary"
            edge="end"
          >
            <Close />
          </IconButton>
          <CardHeader
            className={styles.labelsCardHeader}
            title="Update image labels"
            subheader={props.imageName}
          />
          <CardContent>
            <Grid container className={styles.labelsGrid}>
              <Grid item className={styles.inputGrid}>
                <InputBase
                  key={`input-${props.id}`}
                  placeholder="Enter New Label"
                  value={newLabel}
                  onChange={handleNewLabelChange}
                  inputProps={{
                    className: styles.input,
                  }}
                />
                <IconButton
                  key={`button-add-${props.id}`}
                  type="submit"
                  onClick={handleAddLabel(newLabel)}
                  color="primary"
                >
                  <Add />
                </IconButton>
              </Grid>
              <Grid item>
                {props.labels.map((label) => (
                  <Chip
                    key={`chip-add-${label}`}
                    className={styles.labelsChip}
                    label={label}
                    onDelete={handleDeleteLabel(label)}
                    deleteIcon={<Close />}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Popover>
    </>
  );
}
