import React, { useState, useEffect, ReactElement } from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { IconButton, Paper, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { Search } from "@material-ui/icons";
import { Metadata, MetaItem } from "./interfaces";

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
  callback: (key: string, value: string) => void;
}

export default function ComboBox({
  metadata,
  metadataKeys,
  callback,
}: Props): ReactElement {
  const style = useStyles();
  const [inputKey, setInputKey] = useState("");
  const [inputOptions, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const updateOptions = (): void => {
    const options: Set<string> = new Set();
    metadata.forEach((mitem: MetaItem) => {
      for (const [key, value] of Object.entries(mitem)) {
        if (key === inputKey) {
          if (typeof value === "object") {
            value.forEach((v) => options.add(v));
          } else {
            options.add(value);
          }
        }
      }
    });
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
        callback(inputKey, inputValue);
        e.preventDefault();
      }}
      className={style.root}
    >
      <Autocomplete
        id="combobox-metadata-key"
        className={style.input}
        inputValue={inputKey}
        onInputChange={(e: any, newInputKey: string) => {
          setInputKey(newInputKey);
        }}
        options={metadataKeys}
        renderInput={(params: any) => <TextField {...params} label="Key" />}
      />
      <Autocomplete
        id="combobox-metadata-value"
        className={style.input}
        inputValue={inputValue}
        freeSolo
        onInputChange={(e: any, newInputValue: string) => {
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
