import React, { ChangeEvent, useEffect, useState, ReactElement } from "react";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import {
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Avatar,
} from "@material-ui/core";

import SVG from "react-inlinesvg";
import { theme } from "@/theme";

const useStyles = makeStyles(() =>
  createStyles({
    title: {
      paddingLeft: theme.spacing(1),
    },
    labelsList: { display: "flex", flexDirection: "row", flexWrap: "wrap" },
    labelsListItem: {
      paddingLeft: "12px",
      width: "auto",
      display: "flex",
    },
    labelIcon: {
      color: theme.palette.primary.dark,
    },
    labelText: {
      paddingLeft: theme.spacing(1),
      marginRight: theme.spacing(6),
    },
    buttonsList: {
      display: "flex",
      flexDirection: "row",
      flexWrap: "nowrap",
      marginBottom: "-18px",
    },
    buttonsListItem: {
      padding: theme.spacing(1),
      width: "auto",
    },
    iconButton: {
      marginRight: "-22px",
      marginLeft: "-10px",
    },
    infoOnHover: {
      color: theme.palette.text.secondary,
      fontStyle: "italic",
      fontSize: "12px",
    },
    paper: {
      borderRadius: "inherit",
      height: "49px",
      backgroundColor: (accordionOpened) =>
        accordionOpened
          ? theme.palette.primary.main
          : theme.palette.primary.light,
    },
    accordionDetails: {
      display: "inline",
    },
    accordionTypography: {
      fontWeight: 500,
    },
    avatar: {
      backgroundColor: (accordionOpened) =>
        accordionOpened ? theme.palette.primary.light : "transparent",
      width: "30px",
      height: "30px",
    },
    svgLarge: { width: "55%", height: "100%" },
    svgSmall: { width: "15px", height: "100%" },
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
  const accordionOpened = props.expanded;
  const classes = useStyles(accordionOpened);
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
    if (props.expanded) {
      props.callbackOnLabelSelection(labels);
    }
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
    <div>
      <Accordion expanded={props.expanded} onChange={props.handleToolboxChange}>
        <AccordionSummary
          expandIcon={
            <Avatar className={classes.avatar}>
              <SVG
                src={require("../assets/down-arrow.svg") as string}
                className={classes.svgSmall}
                fill={accordionOpened ? theme.palette.primary.main : null}
              />
            </Avatar>
          }
          id="labels-filter-toolbox"
          className={classes.paper}
        >
          <Typography className={classes.accordionTypography}>
            Annotation Labels
          </Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.accordionDetails}>
          <List component="div" disablePadding className={classes.labelsList}>
            {props.allLabels.map((label) => (
              <ListItem
                key={label}
                dense
                button
                onDoubleClick={SelectDeselectAllButOne(label)}
                onClick={toggleLabelSelection(label)}
                className={classes.labelsListItem}
              >
                {labels.includes(label) ? (
                  <>
                    <SVG
                      src={
                        require("../assets/active-annotation-label-search-filter.svg") as string
                      }
                      className={classes.labelIcon}
                    />
                  </>
                ) : (
                  <SVG
                    src={
                      require("../assets/non-active-annotation-label-search-filter.svg") as string
                    }
                    className={classes.labelIcon}
                  />
                )}
                <ListItemText primary={label} className={classes.labelText} />
              </ListItem>
            ))}
          </List>
          <List component="span" disablePadding className={classes.buttonsList}>
            <ListItem className={classes.buttonsListItem}>
              <IconButton
                className={classes.iconButton}
                onClick={selectAll}
                onMouseOver={() => setInfoOnHover("Select All labels")}
                onMouseOut={() => setInfoOnHover("")}
              >
                <Avatar variant="circular">
                  <SVG
                    className={classes.svgLarge}
                    src={require("../assets/select-all.svg") as string}
                  />
                </Avatar>
              </IconButton>

              <IconButton
                onClick={() => setLabels([])}
                onMouseOver={() => setInfoOnHover("Deselect All labels")}
                onMouseOut={() => setInfoOnHover("")}
              >
                <Avatar variant="circular">
                  <SVG
                    className={classes.svgLarge}
                    src={require("../assets/deselect-all.svg") as string}
                  />
                </Avatar>
              </IconButton>
            </ListItem>
            <ListItem className={classes.infoOnHover}>{infoOnHover}</ListItem>
          </List>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
