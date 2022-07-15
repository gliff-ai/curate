import { ChangeEvent, useEffect, useState, ReactElement } from "react";
import SVG from "react-inlinesvg";
import {
  theme,
  icons,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  MuiIconbutton,
  Avatar,
} from "@gliff-ai/style";

const iconButton = {
  margin: "0 -12px",
  "& svg": {
    width: "55%",
    height: "100%",
  },
};

const labelList = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  "& div": {
    paddingLeft: "12px",
    width: "auto",
    display: "flex",
  },
};
const accordion = {
  marginTop: "15px",
  borderRadius: "9px",
  position: "static",
  "& .Mui-expanded": {
    backgroundColor: theme.palette.primary.main,
    borderRadius: "9px 9px 0 0",
  },
};

const buttonsList = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "nowrap",
  marginBottom: "-18px",
  "& li": {
    padding: theme.spacing(1),
    width: "auto",
    display: "flex",
  },
};

const avatar = {
  backgroundColor: theme.palette.primary.light,
  width: "30px",
  height: "30px",
  "& svg": {
    width: "15px",
    height: "100%",
    transform: "rotate(-90deg)",
  },
};

interface Props {
  expanded: boolean;
  handleToolboxChange: (event: ChangeEvent, isExpanded: boolean) => void;
  allLabels: string[];
  callbackOnLabelSelection: (selectedLabels: string[]) => void;
  callbackOnAccordionExpanded: () => void;
}

export function LabelsFilterAccordion(props: Props): ReactElement {
  const [labels, setLabels] = useState<string[] | null>([]);
  const [infoOnHover, setInfoOnHover] = useState("");

  const toggleLabelSelection = (label: string) => (): void => {
    // Add label to labels if it is not included, otherwise remove it.
    setLabels((prevLabels) => {
      /* eslint-disable @typescript-eslint/no-unsafe-assignment */
      const newLabels: string[] = [...(prevLabels || [])];
      if (newLabels.includes(label)) {
        newLabels.splice(newLabels.indexOf(label), 1);
      } else {
        newLabels.push(label);
      }
      return newLabels;
    });
  };

  const SelectDeselectAllButOne = (label: string) => (): void => {
    // If label deselected, select it and deselect every other label (and vice versa).
    let newSelectedLabels = [];
    if (labels && labels.includes(label)) {
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
    <Accordion
      disableGutters
      expanded={props.expanded}
      onChange={props.handleToolboxChange}
      sx={{ ...accordion }}
    >
      <AccordionSummary
        expandIcon={
          <Avatar
            sx={{
              ...avatar,
            }}
          >
            <SVG
              src={icons.previousNext}
              fill={props.expanded ? theme.palette.primary.main : null}
            />
          </Avatar>
        }
        id="labels-filter-toolbox"
      >
        <Typography sx={{ fontWeight: 500 }}>Annotation Labels</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ display: "inline" }}>
        <List
          component="div"
          disablePadding
          sx={{
            ...labelList,
          }}
        >
          {props.allLabels &&
            props.allLabels.map((label) => (
              <ListItem
                key={label}
                dense
                button
                onDoubleClick={SelectDeselectAllButOne(label)}
                onClick={toggleLabelSelection(label)}
              >
                {labels && labels.includes(label) ? (
                  <>
                    <SVG src={icons.selectedChip} width="20px" height="100%" />
                  </>
                ) : (
                  <SVG src={icons.notSelectedChip} width="20px" height="100%" />
                )}
                <ListItemText
                  primary={label}
                  sx={{
                    paddingLeft: theme.spacing(1),
                    marginRight: theme.spacing(4),
                  }}
                />
              </ListItem>
            ))}
        </List>
        <List component="span" disablePadding sx={{ ...buttonsList }}>
          <ListItem>
            <MuiIconbutton
              sx={{ ...iconButton }}
              onClick={selectAll}
              onMouseOver={() => setInfoOnHover("Select all labels")}
              onMouseOut={() => setInfoOnHover("")}
              size="large"
            >
              <Avatar variant="circular">
                <SVG src={icons.selectAllLabels} />
              </Avatar>
            </MuiIconbutton>

            <MuiIconbutton
              sx={{ ...iconButton }}
              onClick={() => setLabels([])}
              onMouseOver={() => setInfoOnHover("Deselect all labels")}
              onMouseOut={() => setInfoOnHover("")}
              size="large"
            >
              <Avatar variant="circular">
                <SVG src={icons.deselectAllLabels} />
              </Avatar>
            </MuiIconbutton>
            <MuiIconbutton
              sx={{ ...iconButton }}
              onClick={() => setLabels(null)}
              onMouseOver={() => setInfoOnHover("Select all unlabelled images")}
              onMouseOut={() => setInfoOnHover("")}
              size="large"
            >
              <Avatar variant="circular">
                <SVG
                  src={icons.displayUnlabelledImages}
                  fill={labels === null ? theme.palette.primary.main : null}
                />
              </Avatar>
            </MuiIconbutton>
          </ListItem>
          <ListItem
            sx={{
              color: theme.palette.text.secondary,
              fontStyle: "italic",
              fontSize: "12px",
            }}
          >
            {infoOnHover}
          </ListItem>
        </List>
      </AccordionDetails>
    </Accordion>
  );
}
