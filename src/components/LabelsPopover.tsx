import { useState, ReactElement, MouseEvent, ChangeEvent } from "react";
import SVG from "react-inlinesvg";

import { makeStyles } from "@material-ui/core/styles";
import {
  InputBase,
  IconButton,
  Chip,
  Popover,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Typography,
} from "@material-ui/core";
import { Label, Close, Add } from "@material-ui/icons";
import { theme } from "@/theme";
import { HtmlTooltip } from "@/components/HtmlTooltip";

const useStyles = makeStyles({
  cross: {
    position: "absolute",
    right: "10px",
    color: theme.palette.text.primary,
  },
  addButton: { position: "absolute", right: "10px" },
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
    color: theme.palette.primary.light,
    position: "absolute",
    bottom: theme.spacing(1),
    left: theme.spacing(1),
  },
  svgSmall: { width: "10px", height: "100%" },
});

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

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleNewLabelChange = (event: ChangeEvent<HTMLInputElement>) => {
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
          className={classes.addLabelButton}
          aria-describedby={props.id}
          onClick={handleClick}
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
              type="text"
              value={newLabel}
              onChange={handleNewLabelChange}
              inputProps={{
                className: classes.input,
              }}
            />
            <IconButton
              className={classes.addButton}
              key={`button-add-${props.id}`}
              type="submit"
              onClick={handleAddLabel(newLabel)}
            >
              <Add />
            </IconButton>
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
