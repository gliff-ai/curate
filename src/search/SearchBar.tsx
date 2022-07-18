/* eslint-disable react/jsx-props-no-spreading */
import { ChangeEvent, useState, useEffect, ReactElement } from "react";

import { Card, CardContent, Paper, TextField } from "@mui/material";
import Autocomplete, {
  AutocompleteRenderInputParams,
} from "@mui/material/Autocomplete";
import { BaseIconButton, theme } from "@gliff-ai/style";
import { metadataNameMap } from "@/MetadataDrawer";
import { tooltips } from "@/components/Tooltips";
import { Metadata, MetaItem, Filter } from "@/interfaces";

const cardContent = {
  backgroundColor: theme.palette.primary.light,
  borderRadius: "9px",
  marginTop: "15px",
  height: "110px",
  padding: "inherit",
  marginBottom: "15px",
};

interface Props {
  metadata: Metadata;
  metadataKeys: string[];
  callbackSearch: (filter: Filter) => void;
}

interface MetadataLabel {
  key: string;
  label: string;
}

// To be able to style the dropdown list
const CustomPaper = (props: Record<string, unknown>) => (
  <Paper
    elevation={8}
    {...props}
    style={{ backgroundColor: theme.palette.primary.light }}
  />
);

const getLabelsFromKeys = (
  acc: MetadataLabel[],
  key: string
): MetadataLabel[] => {
  // Just an example of how to exclude metadata from the list if we need
  if (
    [
      "fileMetaVersion",
      "id",
      "thumbnail",
      "selected",
      "newGroup",
      "filterShow",
    ].includes(key)
  )
    return acc;

  if (!Object.keys(metadataNameMap).includes(key)) return acc;

  const label = metadataNameMap[key];
  acc.push({
    label,
    key,
  });
  return acc;
};

function SearchBar({
  metadata,
  metadataKeys,
  callbackSearch,
}: Props): ReactElement {
  const [inputKey, setInputKey] = useState<MetadataLabel>();
  const [inputOptions, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [metadataLabels, setMetadataLabels] = useState<MetadataLabel[]>([]);

  const updateOptions = (): void => {
    if (!inputKey?.key || !metadataKeys.includes(inputKey.key)) return;
    const options: Set<string> = new Set();
    metadata.forEach((mitem: MetaItem) => {
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
  };

  useEffect(() => {
    if (inputValue !== "") setInputValue("");
    updateOptions();
  }, [inputKey]);

  useEffect(() => {
    if (!metadataKeys || metadataKeys.length === 0) return;
    const labels = metadataKeys.reduce(
      getLabelsFromKeys,
      [] as MetadataLabel[]
    );
    setMetadataLabels(labels);
  }, [metadataKeys]);

  return (
    <Card
      component="form"
      onSubmit={(e) => {
        callbackSearch({ key: inputKey.key, value: inputValue });
        e.preventDefault();
      }}
      sx={{ display: "inline" }}
    >
      <CardContent sx={{ ...cardContent }}>
        <Autocomplete
          id="combobox-metadata-key"
          sx={{ paddingLeft: "10px", width: "90%" }}
          getOptionLabel={(option: MetadataLabel) => option.label}
          isOptionEqualToValue={(option, value) => option.label === value.label}
          onInputChange={(e: ChangeEvent, newInputKey: string) => {
            // Match the text with the actual key we want
            const metaLabel = metadataLabels.filter(
              ({ label }) => label === newInputKey
            );

            setInputKey(metaLabel?.[0]);
          }}
          options={metadataLabels}
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
          tooltip={tooltips.search}
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

export { getLabelsFromKeys, SearchBar, MetadataLabel };
