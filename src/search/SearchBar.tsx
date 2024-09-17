/* eslint-disable react/jsx-props-no-spreading */
import {
  ChangeEvent,
  useState,
  useEffect,
  ReactElement,
  useCallback,
} from "react";
import { Card, Paper, TextField } from "@mui/material";
import Autocomplete, {
  AutocompleteRenderInputParams,
} from "@mui/material/Autocomplete";
import { IconButton, theme, icons } from "@gliff-ai/style";
import { Filters, FilterData, FilterDataItem } from "@/filter";

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
      sx={{
        display: "flex",
        flexDirection: "column",
        borderRadius: "9px",
        backgroundColor: theme.palette.primary.light,
        height: "110px",
        padding: "10px",
        marginTop: "15px",
        marginBottom: "15px",
      }}
    >
      <Autocomplete
        id="combobox-metadata-key"
        sx={{ "& > div > div": { height: "40px" } }}
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
          <TextField {...params} label="Search Category" variant="outlined" />
        )}
        PaperComponent={CustomPaper}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "end",
          alignItems: "center",
          marginTop: "7px",
        }}
      >
        <Autocomplete
          id="combobox-metadata-value"
          sx={{ width: "100%", "& > div > div": { height: "40px" } }}
          inputValue={inputValue}
          freeSolo
          onInputChange={(e: ChangeEvent, newInputValue: string) => {
            setInputValue(newInputValue);
          }}
          options={inputOptions}
          renderInput={(params: AutocompleteRenderInputParams) => (
            <TextField {...params} label="..." variant="outlined" />
          )}
          PaperComponent={CustomPaper}
        />
        <IconButton
          sx={{ padding: 0 }}
          type="submit"
          icon={icons.search}
          tooltip={{
            name: "Search",
          }}
          fill={null}
          onClick={(e) => {
            if (!inputKey) {
              e?.preventDefault();
            }
          }}
          tooltipPlacement="bottom"
        />
      </div>
    </Card>
  );
}

export { SearchBar, DataKeyLabel };
