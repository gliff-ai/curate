import { ReactElement, useEffect, useState, ChangeEvent } from "react";
import SVG from "react-inlinesvg";
import {
  Typography,
  makeStyles,
  Card,
  Paper,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  MenuItem,
  IconButton,
  Checkbox,
} from "@material-ui/core";
import { BaseTextButton, theme, BasePopover, icons } from "@gliff-ai/style";
import { getLabelsFromKeys, MetadataLabel } from "@/search/SearchBar";
import { tooltips } from "@/components/Tooltips";

const useStyles = makeStyles({
  card: {
    backgroundColor: theme.palette.primary.light,
    width: "260px",
    height: "370px",
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
  sortButton: {
    position: "absolute",
    left: "50%",
    transform: "translate(-50%, 0)",
    bottom: "50px",
  },
  paperPopover: {
    margin: "0 15px",
    padding: "5px",
  },
  typography: {
    color: theme.palette.text.primary,
    display: "inline",
    fontSize: "21px",
    marginLeft: "15px",
  },

  sortLabel: {
    fontSize: "17px",
  },
  menuItem: {
    backgroundColor: "#ffffff !important",
  },
  closeButton: {
    position: "absolute",
    top: "7px",
    right: "5px",
  },
  closeIcon: { width: "15px" },
});

interface Props {
  metadataKeys: string[];
  callbackSort: (key: string, sortOrder: string) => void;
  isGrouped: boolean;
  toggleIsGrouped: () => void;
}

export const SortPopover = ({
  metadataKeys,
  callbackSort,
  isGrouped,
  toggleIsGrouped,
}: Props): ReactElement => {
  const classes = useStyles();
  const [close, setClose] = useState(0);
  const [inputKey, setInputKey] = useState<MetadataLabel>({
    key: "",
    label: "",
  });

  const [sortOrder, setSortOrder] = useState("");
  const [metadataLabels, setMetadataLabels] = useState<MetadataLabel[]>([]);

  const handleChange =
    (func: (value: string) => void) =>
    (event: ChangeEvent<HTMLInputElement>): void => {
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
    const labels = metadataKeys
      .reduce(getLabelsFromKeys, [] as MetadataLabel[])
      .filter(({ key }) => key !== "imageLabels");

    setMetadataLabels(labels);
  }, [metadataKeys]);

  const popoverContent = (
    <Card className={classes.card}>
      <IconButton
        className={classes.closeButton}
        onClick={() => setClose((close) => close + 1)}
      >
        <SVG src={icons.removeLabel} className={classes.closeIcon} />
      </IconButton>
      <Paper
        elevation={0}
        variant="outlined"
        square
        className={classes.paperHeader}
      >
        <Typography className={classes.typography}>Sort</Typography>
      </Paper>
      <Paper elevation={0} square className={classes.paperPopover}>
        {/* Form for selecting a metadata key */}
        <FormControl component="fieldset">
          <TextField
            id="select-metadata-key"
            select
            value={inputKey.label}
            onChange={handleChange(updateKey)}
            helperText="Please select a metadata field"
          >
            {metadataLabels &&
              metadataLabels.map(({ key, label }) => (
                <MenuItem key={key} value={label} className={classes.menuItem}>
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

        <FormControlLabel
          control={
            <Checkbox
              checked={isGrouped}
              onChange={toggleIsGrouped}
              name="group-by"
            />
          }
          label="Group by value"
        />
        <BaseTextButton
          className={classes.sortButton}
          text="Sort"
          onClick={() => {
            const { key } = inputKey;
            if (key === "") return;
            callbackSort(key, sortOrder);
          }}
        />
      </Paper>
    </Card>
  );

  return (
    <BasePopover
      tooltip={tooltips.sort}
      tooltipPlacement="bottom"
      id="sort"
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      children={popoverContent}
      triggerClosing={close}
    />
  );
};
