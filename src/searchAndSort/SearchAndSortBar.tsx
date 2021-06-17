/* eslint-disable react/jsx-props-no-spreading */
import React, { ChangeEvent, useState, useEffect, ReactElement } from "react";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import { Card, CardContent, IconButton, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { Search } from "@material-ui/icons";
import { SortDropdown } from "./SortDropdown";
import { Metadata, MetaItem, Filter } from "./interfaces";
import { metadataNameMap } from "../MetadataDrawer";

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      display: "inline",
    },
    cardContent: {
      backgroundColor: "#fff",
      borderRadius: "9px",
      marginTop: "12px",
      height: "110px",
      padding: "inherit",
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
  const classes = useStyles();
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
        />
        <IconButton
          type="submit"
          aria-label="search"
          className={classes.iconButton}
          onClick={(e) => {
            if (!inputKey) {
              e.preventDefault();
            }
          }}
        >
          <Search />
        </IconButton>
      </CardContent>

      {/* <SortDropdown
        metadataKeys={metadataKeys}
        inputKey={inputKey?.key || ""}
        callback={callbackSort}
      /> */}
    </Card>
  );
}
