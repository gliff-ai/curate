/* eslint-disable react/jsx-props-no-spreading */
import React, { ChangeEvent, useState, useEffect, ReactElement } from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { IconButton, Paper, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { Search } from "@material-ui/icons";
import { SortDropdown } from "./SortDropdown";
import { Metadata, MetaItem, Filter } from "./interfaces";
import { metadataNameMap } from "../MetadataDrawer";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
    },
    input: {
      paddingLeft: "10px",
      width: "250px",
    },
    inputField: {
      fontSize: "11px",
    },
    iconButton: {
      padding: "10px",
    },
  })
);

interface Props {
  metadata: Metadata;
  metadataKeys: string[];
  callbackSearch: (filter: Filter) => void;
  callbackSort: (key: string, sortOrder: string) => void;
}

type MetadataLabel = {
  key: string;
  label: string;
};

export default function SearchAndSortBar({
  metadata,
  metadataKeys,
  callbackSearch,
  callbackSort,
}: Props): ReactElement {
  const style = useStyles();
  const [inputKey, setInputKey] = useState<MetadataLabel>();
  const [inputOptions, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const metadataLabels = metadataKeys.reduce(
    (acc: Array<MetadataLabel>, key) => {
      if (["fileMetaVersion", "id", "thumbnail"].includes(key)) return acc; // Just an example of how to exclude metadata from the list if we need

      const label = metadataNameMap[key] || key;
      acc.push({
        label,
        key,
      });
      return acc;
    },
    [] as MetadataLabel[]
  );

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

  return (
    <Paper
      component="form"
      onSubmit={(e) => {
        callbackSearch({ key: inputKey.key, value: inputValue });
        e.preventDefault();
      }}
      className={style.root}
    >
      <Autocomplete
        id="combobox-metadata-key"
        className={style.input}
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
        renderInput={(params: any) => <TextField {...params} label="Key" />}
      />

      <SortDropdown
        metadataKeys={metadataKeys}
        inputKey={inputKey?.key || ""}
        callback={callbackSort}
      />

      <Autocomplete
        id="combobox-metadata-value"
        className={style.input}
        inputValue={inputValue}
        freeSolo
        onInputChange={(e: ChangeEvent, newInputValue: string) => {
          setInputValue(newInputValue);
        }}
        options={inputOptions}
        renderInput={(params: any) => <TextField {...params} label="Value" />}
      />
      <IconButton
        type="submit"
        aria-label="search"
        className={style.iconButton}
        onClick={(e) => {
          if (!inputKey) {
            e.preventDefault();
          }
        }}
      >
        <Search />
      </IconButton>
    </Paper>
  );
}
