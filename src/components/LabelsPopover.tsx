import React, { useState, ReactElement } from "react";
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
import { Label, Close, Add } from "@material-ui/icons";

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
      backgroundColor: theme.palette.primary.dark,
      color: "#ffffff",
    },
    labelsGrid: {
      width: 300,
      height: "auto",
    },
    labelsChip: {
      margin: 5,
    },
    inputGrid: {
      width: "100%",
    },
    input: {
      borderBottom: "1px solid rgba(0, 0, 0, 0.26)",
      fontSize: 14,
      width: "250px",
    },
    addLabelButton: {
      color: "#ffffff",
      position: "absolute",
      bottom: theme.spacing(1),
      left: theme.spacing(1),
    },
  })
);

interface Props {
  id: string;
  labels: string[];
  imageName: string;
  updateLabels: (newLables: string[]) => void;
}

export function LabelsPopover(props: Props): ReactElement {
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

  return (
    <>
      <Tooltip title="Update image labels" aria-label="label-image">
        <IconButton
          aria-describedby={props.id}
          onClick={handleClick}
          className={styles.addLabelButton}
        >
          <Label />
        </IconButton>
      </Tooltip>
      <Popover
        key={`popover-${props.id}`}
        id={props.id}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Card className={styles.labelsCard}>
          <IconButton
            key={`button-close-${props.id}`}
            className={styles.cross}
            onClick={handleClose}
            edge="end"
          >
            <Close />
          </IconButton>
          <CardHeader
            className={styles.labelsCardHeader}
            title={props.imageName}
            // classess={{
            //   title: { fontSize: 11 },
            // }}
          />
          <CardContent>
            <Grid container className={styles.labelsGrid}>
              <Grid item className={styles.inputGrid}>
                <InputBase
                  key={`input-${props.id}`}
                  placeholder="New label"
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
