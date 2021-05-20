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
  imageLabels: string[];
  callback: (selectedLabels: string[]) => void;
}

export default function LabelsAccordion({
  expanded,
  handleToolboxChange,
  imageLabels,
  callback,
}: Props): ReactElement {
  const style = useStyles();
  const [selectedLabels, setSelectedLabels] = useState(imageLabels);
  const [infoOnHover, setInfoOnHover] = useState("");

  const toggleLabelSelection = (label: string) => (): void => {
    // Add label to list of selectedLabels if not present,
    // delete from it, if present.
    setSelectedLabels((prevState) => {
      const prevLabels = [...prevState];
      if (prevLabels.includes(label)) {
        prevLabels.splice(prevLabels.indexOf(label), 1);
      } else {
        prevLabels.push(label);
      }
      return prevLabels;
    });
  };

  const toggleLabelAndSelectAll = (label: string) => (): void => {
    // Select label if not selected and deselect every other label (and vice versa).
    let newSelectedLabels = [];
    if (selectedLabels.includes(label)) {
      newSelectedLabels = imageLabels.filter((l) => l !== label);
    } else {
      newSelectedLabels.push(label);
    }

    setSelectedLabels(newSelectedLabels);
  };

  const selectAllLabels = () => {
    setSelectedLabels(imageLabels);
  };

  const deselectAllLabels = () => {
    setSelectedLabels([]);
  };

  useEffect(() => {
    callback(selectedLabels);
  }, [selectedLabels]);

  useEffect(() => {
    selectAllLabels();
  }, [imageLabels]);

  return (
    <Accordion expanded={expanded} onChange={handleToolboxChange}>
      <AccordionSummary expandIcon={<ExpandMore />} id="labels-toolbox">
        <Typography className={style.title}>Image labels</Typography>
      </AccordionSummary>
      <AccordionDetails className={style.accordionDetails}>
        <List component="div" disablePadding className={style.labelsList}>
          {imageLabels.map((label) => (
            <ListItem
              key={label}
              dense
              button
              onDoubleClick={toggleLabelAndSelectAll(label)}
              onClick={toggleLabelSelection(label)}
              className={style.labelsListItem}
            >
              {selectedLabels.includes(label) ? (
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
              onClick={() => setSelectedLabels(imageLabels)}
              onMouseOver={() => setInfoOnHover("Select All labels")}
              onMouseOut={() => setInfoOnHover("")}
            >
              <LibraryAddCheckOutlined />
            </IconButton>

            <IconButton
              className={style.iconButton}
              onClick={deselectAllLabels}
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
