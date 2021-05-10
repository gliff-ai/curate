import React, { ReactElement, useEffect, useState, MouseEvent } from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { IconButton, Menu, MenuItem } from "@material-ui/core";
import SortIcon from "@material-ui/icons/Sort";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
    },
    menu: {
      marginRight: theme.spacing(2),
      marginTop: theme.spacing(5),
    },
  })
);

interface Props {
  metadataKeys: string[];
  inputKey: string;
  callback: (key: string, sortOrder: string) => void;
}

export function SortDropdown({
  metadataKeys,
  inputKey,
  callback,
}: Props): ReactElement {
  const style = useStyles();
  type SortOrder = { [index: string]: string };

  const initSortOrder = (): SortOrder => {
    const initSort: SortOrder = {};
    metadataKeys.forEach((key) => {
      initSort[key] = null;
    });
    return initSort;
  };
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(initSortOrder());

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSort = (value: string) => () => {
    if (inputKey === "" || inputKey === "imageLabels") return;
    setSortOrder({ ...sortOrder, [inputKey]: value });
  };

  useEffect(() => {
    callback(inputKey, sortOrder[inputKey]);
  }, [sortOrder]);

  return (
    <div className={style.root}>
      <IconButton
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <SortIcon />
      </IconButton>
      <Menu
        id="simple-menu"
        className={style.menu}
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleSort("asc")}>Sort by ASC</MenuItem>
        <MenuItem onClick={handleSort("des")}>Sort by DESC</MenuItem>
      </Menu>
    </div>
  );
}
