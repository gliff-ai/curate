/* eslint-disable react/jsx-props-no-spreading */
import { ChangeEvent, useState, useEffect, ReactElement } from "react";

import { makeStyles, createStyles } from "@material-ui/core/styles";
import { Card, CardContent, Paper, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { theme } from "@/theme";
import TooltipButton from "@/components/TooltipButton";
import { metadataNameMap } from "@/MetadataDrawer";
import { Metadata, MetaItem, Filter } from "./interfaces";

const useStyles = makeStyles({
  root: {
    display: "inline",
  },
  cardContent: {
    backgroundColor: theme.palette.primary.light,
    borderRadius: "9px",
    marginTop: "15px",
    height: "110px",
    padding: "inherit",
    marginBottom: "15px",
  },
  input1: {
    paddingLeft: "10px",
    width: "90%",
  },
  input2: {
    paddingLeft: "10px",
    width: "80%",
    display: "inline-block",
  },
  inputField: {
    fontSize: "11px",
  },
});

interface Props {
  metadata: Metadata;
  metadataKeys: string[];
  callbackSearch: (filter: Filter) => void;
  callbackSort: (key: string, sortOrder: string) => void;
}

export type MetadataLabel = {
  key: string;
  label: string;
};

// To be able to style the dropdown list
const CustomPaper = (props: any) => (
  <Paper
    elevation={8}
    {...props}
    style={{ backgroundColor: theme.palette.primary.light }}
  />
);
export const getLabelsFromKeys = (
  acc: MetadataLabel[],
  key: string
): MetadataLabel[] => {
  // Just an example of how to exclude metadata from the list if we need
  if (["fileMetaVersion", "id", "thumbnail"].includes(key)) return acc;

  const label = metadataNameMap[key] || key;
  acc.push({
    label,
    key,
  });
  return acc;
};

export default function SearchAndSortBar({
  metadata,
  metadataKeys,
  callbackSearch,
}: Props): ReactElement {
  const classes = useStyles();
  const [inputKey, setInputKey] = useState<MetadataLabel>();
  const [inputOptions, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [metadataLabels, setMetadataLabels] = useState<MetadataLabel[]>([]);

  const updateOptions = (): void => {
    if (!inputKey?.key || !metadataKeys.includes(inputKey.key)) return;
    const options: Set<string> = new Set();
    metadata.forEach((mitem: MetaItem) => {
      if (mitem.selected) {
        const value = mitem[inputKey.key];
        if (Array.isArray(value)) {
          value.forEach((v) => options.add(v));
        } else {
          options.add(value as string);
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
      className={classes.root}
    >
      <CardContent className={classes.cardContent}>
        <Autocomplete
          id="combobox-metadata-key"
          className={classes.input1}
          getOptionLabel={(option: MetadataLabel) => option.label}
          getOptionSelected={(option, value) => option.label === value.label}
          onInputChange={(e: ChangeEvent, newInputKey: string) => {
            // Match the text with the actual key we want
            const metaLabel = metadataLabels.filter(
              ({ label }) => label === newInputKey
            );

            setInputKey(metaLabel?.[0]);
          }}
          options={metadataLabels}
          renderInput={(params: any) => (
            <TextField {...params} label="Search Category" />
          )}
          PaperComponent={CustomPaper}
        />
        <Autocomplete
          id="combobox-metadata-value"
          className={classes.input2}
          inputValue={inputValue}
          freeSolo
          onInputChange={(e: ChangeEvent, newInputValue: string) => {
            setInputValue(newInputValue);
          }}
          options={inputOptions}
          renderInput={(params: any) => <TextField {...params} label="..." />}
          PaperComponent={CustomPaper}
        />
        <TooltipButton
          type="submit"
          tooltip="Search"
          svgSrc="search"
          onClick={(e) => {
            if (!inputKey) {
              e?.preventDefault();
            }
          }}
        />
      </CardContent>
    </Card>
  );
}
