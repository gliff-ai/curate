/* eslint-disable react/jsx-props-no-spreading */
import {
  ChangeEvent,
  useState,
  useEffect,
  ReactElement,
  useCallback,
} from "react";
import { Card, CardContent, Paper, TextField } from "@mui/material";
import Autocomplete, {
  AutocompleteRenderInputParams,
} from "@mui/material/Autocomplete";
import { BaseIconButton, theme, icons } from "@gliff-ai/style";
import { Filters, FilterData, FilterDataItem } from "@/filter";

const cardContent = {
  backgroundColor: theme.palette.primary.light,
  borderRadius: "9px",
  marginTop: "15px",
  height: "110px",
  padding: "inherit",
  marginBottom: "15px",
};

interface DataKeyLabel {
  key: string;
  label: string;
}
interface Props {
  data: FilterData;
  filters: Filters;
  updateData: (func: (data: FilterData) => FilterData) => void;
  getLabelsFromKeys: (acc: DataKeyLabel[], key: string) => DataKeyLabel[];
}

// To be able to style the dropdown list
const CustomPaper = (props: Record<string, unknown>) => (
  <Paper
    elevation={8}
    {...props}
    style={{ backgroundColor: theme.palette.primary.light }}
  />
);

function SearchBar({
  data,
  filters,
  updateData,
  getLabelsFromKeys,
}: Props): ReactElement {
  const [dataKeys, setDataKeys] = useState<string[]>([]);
  const [inputKey, setInputKey] = useState<DataKeyLabel>();
  const [inputOptions, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [dataKeyLabels, setDataKeyLabels] = useState<DataKeyLabel[]>([]);

  const updateOptions = useCallback((): void => {
    if (!inputKey?.key || !dataKeys.includes(inputKey.key)) return;

    const options: Set<string> = new Set();

    data.forEach((mitem: FilterDataItem) => {
      if (mitem.filterShow && mitem[inputKey.key] !== undefined) {
        const value = mitem[inputKey.key];
        if (Array.isArray(value)) {
          value.forEach((v) => options.add(v));
        } else {
          options.add(String(value));
        }
      }
    });

    options.add("All values");
    setOptions(Array.from(options));
  }, [inputKey, data, dataKeys]);

  useEffect(() => {
    setInputValue("");
  }, [inputKey]);

  useEffect(() => {
    if (data.length > 0) {
      setDataKeys(filters.getDataKeys(data[0]));
    }
  }, [data, filters]);

  useEffect(() => {
    updateOptions();
  }, [updateOptions]);

  useEffect(() => {
    if (!dataKeys || dataKeys.length === 0) return;
    const labels = dataKeys.reduce(getLabelsFromKeys, [] as DataKeyLabel[]);
    setDataKeyLabels(labels);
  }, [dataKeys, getLabelsFromKeys]);

  return (
    <Card
      component="form"
      onSubmit={(e) => {
        updateData((prevData) =>
          filters.applyFilter(prevData, {
            key: inputKey.key,
            value: inputValue,
          })
        );
        e.preventDefault();
      }}
      sx={{ display: "inline" }}
    >
      <CardContent sx={{ ...cardContent }}>
        <Autocomplete
          id="combobox-metadata-key"
          sx={{ paddingLeft: "10px", width: "90%" }}
          getOptionLabel={(option: DataKeyLabel) => option.label}
          isOptionEqualToValue={(option, value) => option.label === value.label}
          onInputChange={(e: ChangeEvent, newInputKey: string) => {
            // Match the text with the actual key we want
            const metaLabel = dataKeyLabels.filter(
              ({ label }) => label === newInputKey
            );

            setInputKey(metaLabel?.[0]);
          }}
          options={dataKeyLabels}
          renderInput={(params: AutocompleteRenderInputParams) => (
            <TextField {...params} label="Search Category" variant="standard" />
          )}
          PaperComponent={CustomPaper}
        />
        <Autocomplete
          id="combobox-metadata-value"
          sx={{ paddingLeft: "10px", width: "80%", display: "inline-block" }}
          inputValue={inputValue}
          freeSolo
          onInputChange={(e: ChangeEvent, newInputValue: string) => {
            setInputValue(newInputValue);
          }}
          options={inputOptions}
          renderInput={(params: AutocompleteRenderInputParams) => (
            <TextField {...params} label="..." variant="standard" />
          )}
          PaperComponent={CustomPaper}
        />

        <BaseIconButton
          type="submit"
          tooltip={{
            name: "Search",
            icon: icons.search,
          }}
          fill={null}
          onClick={(e) => {
            if (!inputKey) {
              e?.preventDefault();
            }
          }}
          tooltipPlacement="bottom"
        />
      </CardContent>
    </Card>
  );
}

export { SearchBar, DataKeyLabel };
