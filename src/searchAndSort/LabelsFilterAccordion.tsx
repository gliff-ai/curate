import { ChangeEvent, useEffect, useState, ReactElement } from "react";
import { makeStyles } from "@material-ui/core/styles";
import SVG from "react-inlinesvg";

import { svgSrc } from "@/helpers";
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

import { theme } from "@/theme";

const useStyles = makeStyles({
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
    width: "20px",
    height: "auto",
    color: theme.palette.primary.dark,
  },
  labelText: {
    paddingLeft: theme.spacing(1),
    marginRight: theme.spacing(4),
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
});

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
  const [labels, setLabels] = useState([]);
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
      props.callbackOnAccordionExpanded();
    }
  }, [props.expanded]);

  return (
    <div>
      <Accordion expanded={props.expanded} onChange={props.handleToolboxChange}>
        <AccordionSummary
          expandIcon={
            <Avatar className={classes.avatar}>
              <SVG
                src={svgSrc("down-arrow")}
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
                      src={svgSrc("active-annotation-label-search-filter")}
                      className={classes.labelIcon}
                    />
                  </>
                ) : (
                  <SVG
                    src={svgSrc("non-active-annotation-label-search-filter")}
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
                    src={svgSrc("select-all")}
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
                    src={svgSrc("deselect-all")}
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
