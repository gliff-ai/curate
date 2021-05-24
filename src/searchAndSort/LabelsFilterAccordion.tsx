import React, { ChangeEvent, useEffect, useState, ReactElement } from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import {
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@material-ui/core";
import {
  ExpandMore,
  Label,
  LabelOutlined,
  LibraryAddCheckOutlined,
  HighlightOffOutlined,
} from "@material-ui/icons";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    accordionDetails: {
      display: "block",
      maxWidth: 300,
    },
    title: {
      paddingLeft: theme.spacing(1),
    },
    labelsList: { display: "flex", flexDirection: "row", flexWrap: "wrap" },
    labelsListItem: {
      paddingLeft: theme.spacing(2),
      width: "auto",
    },
    labelIcon: {
      color: theme.palette.primary.dark,
    },
    labelText: {
      paddingLeft: theme.spacing(2),
    },
    buttonsList: { display: "flex", flexDirection: "row", flexWrap: "nowrap" },
    buttonsListItem: {
      padding: theme.spacing(1),
      width: "auto",
    },
    iconButton: {
      color: theme.palette.primary.dark,
    },
    infoOnHover: {
      color: theme.palette.primary.light,
      fontStyle: "italic",
    },
  })
);

interface Props {
  expanded: boolean;
  handleToolboxChange: (event: ChangeEvent, isExpanded: boolean) => void;
  allLabels: string[];
  callbackOnLabelSelection: (selectedLabels: string[]) => void;
  callbackOnAccordionExpanded: () => void;
}

export default function LabelsFilterAccordion(props: Props): ReactElement {
  const style = useStyles();
  const [labels, setLabels] = useState(props.allLabels);
  const [infoOnHover, setInfoOnHover] = useState("");

  const toggleLabelSelection = (label: string) => (): void => {
    // Add label to labels if it is not included, otherwise remove it.
    setLabels((prevState) => {
      const prevLabels = [...prevState];
      if (prevLabels.includes(label)) {
        prevLabels.splice(prevLabels.indexOf(label), 1);
      } else {
        prevLabels.push(label);
      }
      return prevLabels;
    });
  };

  const SelectDeselectAllButOne = (label: string) => (): void => {
    // If label deselected, select it and deselect every other label (and vice versa).
    let newSelectedLabels = [];
    if (labels.includes(label)) {
      newSelectedLabels = props.allLabels.filter((l) => l !== label);
    } else {
      newSelectedLabels.push(label);
    }

    setLabels(newSelectedLabels);
  };

  const selectAll = () => setLabels(props.allLabels);

  useEffect(() => {
    props.callbackOnLabelSelection(labels);
  }, [labels]);

  useEffect(() => {
    if (props.expanded) {
      selectAll();
      props.callbackOnAccordionExpanded();
    }
  }, [props.expanded]);

  useEffect(() => {
    selectAll();
  }, [props.allLabels]);

  return (
    <Accordion expanded={props.expanded} onChange={props.handleToolboxChange}>
      <AccordionSummary expandIcon={<ExpandMore />} id="labels-filter-toolbox">
        <Typography className={style.title}>Image labels</Typography>
      </AccordionSummary>
      <AccordionDetails className={style.accordionDetails}>
        <List component="div" disablePadding className={style.labelsList}>
          {props.allLabels.map((label) => (
            <ListItem
              key={label}
              dense
              button
              onDoubleClick={SelectDeselectAllButOne(label)}
              onClick={toggleLabelSelection(label)}
              className={style.labelsListItem}
            >
              {labels.includes(label) ? (
                <Label className={style.labelIcon} />
              ) : (
                <LabelOutlined className={style.labelIcon} />
              )}
              <ListItemText primary={label} className={style.labelText} />
            </ListItem>
          ))}
        </List>
        <List component="span" disablePadding className={style.buttonsList}>
          <ListItem className={style.buttonsListItem}>
            <IconButton
              className={style.iconButton}
              onClick={selectAll}
              onMouseOver={() => setInfoOnHover("Select All labels")}
              onMouseOut={() => setInfoOnHover("")}
            >
              <LibraryAddCheckOutlined />
            </IconButton>

            <IconButton
              className={style.iconButton}
              onClick={() => setLabels([])}
              onMouseOver={() => setInfoOnHover("Deselect All labels")}
              onMouseOut={() => setInfoOnHover("")}
            >
              <HighlightOffOutlined />
            </IconButton>
          </ListItem>
          <ListItem className={style.infoOnHover}>{infoOnHover}</ListItem>
        </List>
      </AccordionDetails>
    </Accordion>
  );
}
