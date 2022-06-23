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
import { Filters, FilterData } from "@/filter";

type DataKeyLabel = { key: string; label: string };

interface Props {
  data: FilterData;
  filters: Filters;
  updateData: (func: (data: FilterData) => FilterData) => void;
  getLabelsFromKeys: (acc: DataKeyLabel[], key: string) => DataKeyLabel[];
}

export const SortPopover = ({
  data,
  filters,
  updateData,
  getLabelsFromKeys,
}: Props): ReactElement => {
  const [inputKey, setInputKey] = useState<DataKeyLabel>({
    key: "",
    label: "",
  });
  const [dataKeyLabels, setDataKeyLabels] = useState<DataKeyLabel[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isGrouped, setIsGrouped] = useState<boolean>(filters.isGrouped); // added to trigger re-rendering

  const handleChange =
    <T extends string>(func: (value: T) => void) =>
    (event: ChangeEvent<HTMLInputElement>): void => {
      event.preventDefault();
      const { value } = event.target as HTMLButtonElement;
      func(value as T);
    };

  const updateKey = (selectedLabel: string): void => {
    const metaLabel = dataKeyLabels.filter(
      ({ label }) => label === selectedLabel
    );
    setInputKey(metaLabel?.[0]);
  };

  useEffect(() => {
    if (data.length > 0) {
      const newKeys = filters.getDataKeys(data[0]);

      if (newKeys && newKeys.length > 0) {
        const labels = newKeys.reduce(getLabelsFromKeys, [] as DataKeyLabel[]);
        setDataKeyLabels(labels);
      }
    }
  }, [data, filters, getLabelsFromKeys]);

  return (
    <Popover
      title="Sort"
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
            {dataKeyLabels &&
              dataKeyLabels.map(({ key, label }) => (
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
          {inputKey.label && (
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
                    onChange={() => {
                      filters.toggleIsGrouped();
                      setIsGrouped((value) => !value);
                    }}
                    name="group-by"
                  />
                }
                label="Group by value"
              />
            </>
          )}
        </Paper>
        <BaseTextButton
          text="Sort"
          onClick={() => {
            const { key } = inputKey;
            if (!key) return;

            updateData((metadata: FilterData): FilterData => {
              let newMetadata = filters.sortData(
                metadata,
                key,
                sortOrder === "asc"
              );

              newMetadata = filters.groupByValue(newMetadata || metadata);

              return newMetadata;
            });
          }}
          style={{ display: "block", margin: "auto" }}
        />
      </>
    </Popover>
  );
};
