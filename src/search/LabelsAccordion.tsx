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
} from "@material-ui/core";
import { ExpandMore, Label, LabelOutlined } from "@material-ui/icons";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      maxWidth: 300,
    },
    title: {
      paddingLeft: theme.spacing(1),
    },
    listItem: {
      paddingLeft: theme.spacing(1),
    },
    text: {
      paddingLeft: theme.spacing(4),
    },
    icon: {
      color: theme.palette.primary.dark,
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
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  const addDelLabel = (label: string) => (): void => {
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
  useEffect(() => {
    callback(selectedLabels);
  }, [selectedLabels]);

  return (
    <Accordion expanded={expanded} onChange={handleToolboxChange}>
      <AccordionSummary expandIcon={<ExpandMore />} id="labels-toolbox">
        <Typography className={style.title}>Image labels</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <List component="div" disablePadding className={style.root}>
          {imageLabels.map((label) => (
            <ListItem
              key={label}
              dense
              button
              onClick={addDelLabel(label)}
              className={style.listItem}
            >
              {(() => {
                if (selectedLabels.includes(label))
                  return <Label className={style.icon} />;
                return <LabelOutlined className={style.icon} />;
              })()}
              <ListItemText primary={label} className={style.text} />
            </ListItem>
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
}
