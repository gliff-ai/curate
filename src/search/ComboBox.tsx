/* eslint-disable no-use-before-define */
import React, { useState, useEffect } from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { Metadata, MetaItem } from "./interfaces";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import Paper from "@material-ui/core/Paper";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      right: "10px",
    },
    input: {
      paddingLeft: "10px",
      width: "250px",
    },
    iconButton: {
      padding: 10,
    },
  })
);

interface Props {
  metadata: Metadata;
  metadataKeys: string[];
  callback?: (key: string, value: string) => void;
}

export default function ComboBox({ metadata, metadataKeys, callback }: Props) {
  const style = useStyles();
  const [inputKey, setInputKey] = useState("");
  const [inputOptions, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    inputValue === "" || setInputValue("");
    updateOptions();
  }, [inputKey]);

  function updateOptions(): void {
    let options: Set<string> = new Set();
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
  }

  return (
    <Paper
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        callback(inputKey, inputValue);
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
        key={inputValue}
        id="combobox-metadata-value"
        className={style.input}
        inputValue={inputValue}
        onInputChange={(e: any, newInputValue: string) => {
          if (newInputValue !== "") {
            setInputValue(newInputValue);
          }
        }}
        options={inputOptions}
        renderInput={(params: any) => <TextField {...params} label="Value" />}
      />
      <IconButton
        type="submit"
        aria-label="search"
        className={style.iconButton}
      >
        <SearchIcon />
      </IconButton>
    </Paper>
  );
}
