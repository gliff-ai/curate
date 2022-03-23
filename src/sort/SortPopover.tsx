import { ReactElement, useEffect, useState, ChangeEvent } from "react";
import {
  BaseTextButton,
  RadioGroup,
  MenuItem,
  Paper,
  FormControl,
  TextField,
  FormControlLabel,
  Radio,
  Checkbox,
  IconButton,
  Dialog,
  icons,
} from "@gliff-ai/style";
import { getLabelsFromKeys, MetadataLabel } from "@/search/SearchBar";
import { tooltips } from "@/components/Tooltips";

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

  return (
    <Dialog
      title="Sort"
      // id="sort"
      TriggerButton={
        <IconButton
          tooltip={{
            name: "Sort",
          }}
          icon={icons.searchFilter}
          tooltipPlacement="bottom"
        />
      }
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <>
        <FormControl component="fieldset">
          <TextField
            id="select-metadata-key"
            select
            value={inputKey.label}
            onChange={handleChange(updateKey)}
            helperText="Please select a metadata field"
            variant="standard"
          >
            {metadataLabels &&
              metadataLabels.map(({ key, label }) => (
                <MenuItem key={key} value={label}>
                  {label}
                </MenuItem>
              ))}
          </TextField>
        </FormControl>

        <Paper
          elevation={0}
          square
          style={{ padding: "10px", marginLeft: "15px" }}
        >
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
              />
              <FormControlLabel
                value="desc"
                control={<Radio size="small" />}
                label="Sort by DESC"
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
        </Paper>
        <BaseTextButton
          text="Sort"
          onClick={() => {
            const { key } = inputKey;
            if (key === "") return;
            callbackSort(key, sortOrder);
          }}
          style={{ display: "block", margin: "auto" }}
        />
      </>
    </Dialog>
  );
};
