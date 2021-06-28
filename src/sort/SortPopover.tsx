import React, { ReactElement, useEffect, useState } from "react";
import {
  Popover,
  Typography,
  Button,
  makeStyles,
  Theme,
  Card,
  Paper,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  MenuItem,
  Tooltip,
  IconButton,
  Avatar,
  withStyles,
} from "@material-ui/core";
import {
  getLabelsFromKeys,
  MetadataLabel,
} from "@/searchAndSort/SearchAndSortBar";

import { theme } from "@/theme";

import SVG from "react-inlinesvg";

const useStyles = makeStyles(() => ({
  card: {
    backgroundColor: theme.palette.primary.light,
    width: "250px",
    height: "300px",
  },
  paperHeader: {
    backgroundColor: theme.palette.primary.main,
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
  },
  paper: {
    padding: "10px",
    marginLeft: "15px",
  },
  typography: {
    color: theme.palette.text.primary,
    display: "inline",
    fontSize: "21px",
    marginLeft: "15px",
  },

  sortButton: {
    position: "absolute",
    bottom: "18px",
    left: "85px",
    backgroundColor: theme.palette.primary.main,
  },
  sortLabel: {
    fontSize: "17px",
  },
  cross: {
    position: "absolute",
    top: "-5px",
    right: theme.spacing(1),
  },
  iconButton: {
    padding: "0px",
    paddingTop: "4px",
    marginRight: "4px",
    marginLeft: "8px",
  },
  closeAvatar: {
    width: "30px",
    height: "30px",
  },
  svgMedium: {
    width: "22px",
    height: "100%",
    marginLeft: "-1px",
  },
  svgSmall: {
    width: "12px",
    height: "100%",
  },
}));

const HtmlTooltip = withStyles((t: Theme) => ({
  tooltip: {
    backgroundColor: theme.palette.primary.light,
    fontSize: t.typography.pxToRem(12),
    border: "1px solid #dadde9",
    color: theme.palette.text.primary,
  },
}))(Tooltip);

interface Props {
  metadataKeys: string[];
  callbackSort: (key: string, sortOrder: string) => void;
}

export const SortPopover = ({
  metadataKeys,
  callbackSort,
}: Props): ReactElement => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [inputKey, setInputKey] = useState<MetadataLabel>({
    key: "",
    label: "",
  });
  const [hover, sethover] = useState(false);

  const [sortOrder, setSortOrder] = useState("");
  const [metadataLabels, setMetadataLabels] = useState<MetadataLabel[]>([]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const handleChange =
    (func: (value: string) => void) =>
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      event.preventDefault();
      const { value } = event.target as HTMLButtonElement;
      func(value);
    };

  const updateKey = (selectedLabel: string): void => {
    const metaLabel = metadataLabels.filter(
      ({ label }) => label === selectedLabel
    );
    setInputKey(metaLabel?.[0]);
  };

  useEffect(() => {
    if (!metadataKeys || metadataKeys.length === 0) return;
    const labels = metadataKeys.reduce(
      getLabelsFromKeys,
      [] as MetadataLabel[]
    );
    setMetadataLabels(labels);
  }, [metadataKeys]);

  return (
    <>
      <HtmlTooltip
        title={<Typography color="inherit">Sort</Typography>}
        placement="top"
      >
        <IconButton onClick={handleClick} className={classes.iconButton}>
          <Avatar variant="circular">
            <SVG
              src={require(`../assets/search-filter.svg`) as string}
              className={classes.svgMedium}
            />
          </Avatar>
        </IconButton>
      </HtmlTooltip>

      <Popover
        id="sort-popover"
        open={Boolean(anchorEl)}
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
        <Card className={classes.card}>
          <IconButton
            className={classes.cross}
            onClick={handleClose}
            edge="end"
          >
            <Avatar
              variant="circle"
              onMouseOut={() => {
                sethover(false);
              }}
              onMouseOver={() => {
                sethover(true);
              }}
              className={classes.closeAvatar}
            >
              <SVG
                src={require("../assets/close.svg") as string}
                className={classes.svgSmall}
                fill={
                  hover
                    ? theme.palette.primary.main
                    : theme.palette.text.primary
                }
              />
            </Avatar>
          </IconButton>
          <Paper
            elevation={0}
            variant="outlined"
            square
            className={classes.paperHeader}
          >
            <Typography className={classes.typography}>Sort</Typography>
          </Paper>
          <Paper elevation={0} square className={classes.paper}>
            {/* Form for selecting a metadata key */}
            <FormControl component="fieldset">
              <TextField
                id="select-metadata-key"
                select
                value={inputKey.label}
                onChange={handleChange(updateKey)}
                helperText="Please select a metadata field"
              >
                {metadataLabels.map(({ key, label }) => (
                  <MenuItem key={key} value={label}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>
          </Paper>
          <Paper elevation={0} square className={classes.paper}>
            {/* Form for selecting a sort order */}
            <FormControl component="fieldset">
              <RadioGroup
                aria-label="sort-order"
                name="sort-order"
                value={sortOrder}
                onChange={handleChange(setSortOrder)}
              >
                <FormControlLabel
                  value="asc"
                  control={<Radio size="small" />}
                  label="Sort by ASC"
                  classes={{
                    label: classes.sortLabel,
                  }}
                />
                <FormControlLabel
                  value="desc"
                  control={<Radio size="small" />}
                  label="Sort by DESC"
                  classes={{
                    label: classes.sortLabel,
                  }}
                />
              </RadioGroup>
            </FormControl>
            <Button
              variant="outlined"
              className={classes.sortButton}
              onClick={() => {
                const { key } = inputKey;
                if (key === "" || key === "imageLabels") return;
                callbackSort(key, sortOrder);
              }}
            >
              Sort
            </Button>
          </Paper>
        </Card>
      </Popover>
    </>
  );
};
