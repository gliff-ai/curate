import React, { ChangeEvent, ReactElement } from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import {
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
} from "@material-ui/core";
import { ExpandMore, Clear } from "@material-ui/icons";
import { Filter } from "@/searchAndSort/interfaces";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      maxWidth: 300,
    },
    title: {
      paddingLeft: theme.spacing(1),
    },
    list: { display: "flex", flexDirection: "row", flexWrap: "wrap" },
    listItem: {
      padding: `${theme.spacing(0)}, ${theme.spacing(0)}`,
      marginLeft: theme.spacing(1),
      marginBottom: theme.spacing(1),
      width: "auto",
      border: "1px solid",
      borderColor: theme.palette.primary.dark,
      borderRadius: 10,
    },
    icon: {
      color: theme.palette.primary.dark,
      fontSize: 14,
    },
    text: {
      paddingLeft: theme.spacing(2),
      color: theme.palette.primary.dark,
    },
  })
);

interface Props {
  expanded: boolean;
  handleToolboxChange: (event: ChangeEvent, isExpanded: boolean) => void;
  activeFilters: Filter[];
  callback: (filter: Filter) => void;
}

export default function ActiveFiltersAccordion({
  expanded,
  handleToolboxChange,
  activeFilters,
  callback,
}: Props): ReactElement {
  const style = useStyles();

  return (
    <Accordion
      expanded={expanded}
      onChange={handleToolboxChange}
      className={style.root}
    >
      <AccordionSummary expandIcon={<ExpandMore />} id="search-filter-toolbox">
        <Typography className={style.title}>Active Search Filters</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <List component="div" disablePadding className={style.list}>
          {activeFilters.map((f) => (
            <ListItem
              key={`${f.key}: ${f.value}`}
              onClick={() => callback(f)}
              className={style.listItem}
              button
              dense
            >
              <Clear className={style.icon} />
              <ListItemText
                primary={`${f.key}: ${f.value}`}
                className={style.text}
              />
            </ListItem>
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
}
