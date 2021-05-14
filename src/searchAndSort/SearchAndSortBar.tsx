/* eslint-disable react/jsx-props-no-spreading */
import React, { ChangeEvent, useState, useEffect, ReactElement } from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { IconButton, Paper, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { Search } from "@material-ui/icons";
import { SortDropdown } from "./SortDropdown";
import { Metadata, MetaItem } from "./interfaces";
import { metadataNameMap } from "../MetadataDrawer";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      right: "10px",
      height: "85%",
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
  callbackSearch: (key: string, value: string) => void;
  callbackSort: (key: string, sortOrder: string) => void;
}

export default function SearchAndSortBar({
  metadata,
  metadataKeys,
  callbackSearch,
  callbackSort,
}: Props): ReactElement {
  const style = useStyles();
  const [inputKey, setInputKey] = useState("");
  const [inputOptions, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const prettyToUgly = (pretty: string): string => {
    // map backwards from pretty name to metadata key (e.g. "Number Of Dimensions" -> "numberOfDimensions")
    let key;
    Object.entries(metadataNameMap).forEach(([_key, value]) => {
      if (value === pretty) {
        key = _key;
      }
    });
    return key;
  };

  const updateOptions = (): void => {
    const key = prettyToUgly(inputKey);
    console.log(key);
    if (key === undefined) return;
    const options: Set<string> = new Set();
    metadata.forEach((mitem: MetaItem) => {
      const value = mitem[key];
      if (Array.isArray(value)) {
        value.forEach((v) => options.add(v));
      } else {
        options.add(value);
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
        callbackSearch(prettyToUgly(inputKey), inputValue);
        e.preventDefault();
      }}
      className={style.root}
    >
      <Autocomplete
        id="combobox-metadata-key"
        className={style.input}
        inputValue={inputKey}
        onInputChange={(e: ChangeEvent, newInputKey: string) => {
          setInputKey(newInputKey);
        }}
        options={Object.values(metadataNameMap)}
        renderInput={(params: any) => <TextField {...params} label="Key" />}
      />
      <SortDropdown
        metadataKeys={metadataKeys}
        inputKey={inputKey}
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
      >
        <Search />
      </IconButton>
    </Paper>
  );
}
