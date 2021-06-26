import React, { useState, ReactElement } from "react";
import { theme } from "@/theme";

import {
  makeStyles,
  createStyles,
  Theme,
  withStyles,
} from "@material-ui/core/styles";
import {
  InputBase,
  IconButton,
  Tooltip,
  Chip,
  Popover,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Avatar,
  Typography,
} from "@material-ui/core";
import { Label, Close, Add } from "@material-ui/icons";
import SVG from "react-inlinesvg";

const useStyles = makeStyles(() =>
  createStyles({
    cross: {
      position: "absolute",
      marginLeft: "223px",
      color: theme.palette.text.primary,
    },
    cardContent: {
      paddingBottom: "18px",
      padding: 0,
    },
    labelsCard: {
      borderRadius: "9px",
      backgroundColor: theme.palette.primary.light,
      width: "271px",
    },
    labelsCardHeader: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.text.primary,
      height: "44px",
    },
    cardHeaderTypography: {
      fontSize: "21px",
    },

    labelsChip: {
      margin: "5px",
      marginLeft: "10px",
      borderRadius: "9px",
      color: theme.palette.text.secondary,
    },
    inputGrid: {
      width: "100%",
    },
    input: {
      fontSize: 14,
      marginRight: "60px",
      marginLeft: "12px",
      marginBottom: "13px",
    },
    addLabelButton: {
      color: theme.palette.primary.light,
      position: "absolute",
      bottom: theme.spacing(1),
      left: theme.spacing(1),
    },
    svgSmall: { width: "10px", height: "100%" },
  })
);

const HtmlTooltip = withStyles((t: Theme) => ({
  tooltip: {
    backgroundColor: theme.palette.primary.light,
    fontSize: t.typography.pxToRem(12),
    border: "1px solid #dadde9",
    color: theme.palette.text.primary,
  },
}))(Tooltip);

interface Props {
  id: string;
  labels: string[];
  imageName: string;
  updateLabels: (newLables: string[]) => void;
}

export function LabelsPopover(props: Props): ReactElement {
  const classes = useStyles();
  const [anchorElement, setAnchorEl] = useState<HTMLButtonElement | null>(null);
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
      <HtmlTooltip
        title={<Typography>Update image labels</Typography>}
        placement="top-start"
      >
        <IconButton
          aria-describedby={props.id}
          onClick={handleClick}
          className={classes.addLabelButton}
        >
          <Label />
        </IconButton>
      </HtmlTooltip>

      <Popover
        key={`popover-${props.id}`}
        id={props.id}
        open={Boolean(anchorElement)}
        anchorEl={anchorElement}
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
        <Card className={classes.labelsCard}>
          <IconButton
            key={`button-close-${props.id}`}
            className={classes.cross}
            onClick={handleClose}
          >
            <Close />
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
            <InputBase
              key={`input-${props.id}`}
              placeholder="New label"
              value={newLabel}
              onChange={handleNewLabelChange}
              inputProps={{
                className: classes.input,
              }}
            />
            <IconButton
              key={`button-add-${props.id}`}
              type="submit"
              onClick={handleAddLabel(newLabel)}
            >
              <Add />
            </IconButton>
            <Divider />
            {props.labels.map((label) => (
              <Chip
                key={`chip-add-${label}`}
                avatar={
                  <Avatar
                    variant="circular"
                    style={{ cursor: "pointer" }}
                    onClick={handleDeleteLabel(label)}
                  >
                    <SVG
                      src={require("../assets/close.svg") as string}
                      className={classes.svgSmall}
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
      </Popover>
    </>
  );
}
