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
  Popover,
  icons,
} from "@gliff-ai/style";
import { getLabelsFromKeys, MetadataLabel } from "@/search/SearchBar";

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

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [metadataLabels, setMetadataLabels] = useState<MetadataLabel[]>([]);

  const handleChange =
    <T extends string>(func: (value: T) => void) =>
    (event: ChangeEvent<HTMLInputElement>): void => {
      event.preventDefault();
      const { value } = event.target as HTMLButtonElement;
      func(value as T);
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
    <Popover
      title="Sort"
      // id="sort"
      TriggerButton={
        <IconButton
          tooltip={{
            name: "Sort",
          }}
          icon={icons.searchFilter}
          tooltipPlacement="top"
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
            onChange={handleChange<string>(updateKey)}
            helperText={!inputKey.label ? "Please select a metadata field" : ""}
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
          {inputKey.label ? (
            <>
              {/* Form for selecting a sort order */}
              <FormControl component="fieldset">
                <RadioGroup
                  aria-label="sort-order"
                  name="sort-order"
                  value={sortOrder}
                  onChange={handleChange<"asc" | "desc">(setSortOrder)}
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
            </>
          ) : (
            <></>
          )}
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
    </Popover>
  );
};
