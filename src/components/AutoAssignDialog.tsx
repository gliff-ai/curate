import { useEffect, useState } from "react";
import {
  Paper,
  Card,
  Dialog,
  Typography,
  makeStyles,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  Button,
  IconButton,
} from "@material-ui/core";
import { Close } from "@material-ui/icons";
import { BaseIconButton, theme } from "@gliff-ai/style";
import { tooltips } from "@/components";
import { Profile } from "./interfaces";
import { kCombinations, shuffle } from "@/helpers";
import { Metadata } from "@/searchAndSort/interfaces";

const useStyles = makeStyles(() => ({
  paperHeader: { padding: "10px", backgroundColor: theme.palette.primary.main },
  paperBody: { margin: "15px" },
  container: { textAlign: "center" },
  card: {
    display: "flex",
    flexDirection: "column",
    width: "auto",
    hegith: "400px",
  },
  button: {
    marginTop: "20px",
    backgroundColor: theme.palette.primary.main,
    display: "inlineBlock",
  },
  topography: {
    color: "#000000",
    display: "inline",
    fontSize: "21px",
    marginRight: "125px",
  },
}));

interface Props {
  collaborators: Profile[];
  selectedImagesUids: string[];
  metadata: Metadata;
  updateAssignees: (value: string[], selectedUids?: string[]) => void;
}

enum SelectionType {
  "All" = 0,
  "Selected" = 1,
}

export function AutoAssignDialog(props: Props): React.ReactElement {
  const classes = useStyles();
  const [open, setOpen] = useState<boolean>(false);
  const [imageSelectionType, setImageSelectionType] = useState<number>(
    SelectionType.All
  );
  const [assigneesPerImage, setAssigneesPerImage] = useState<number>(1);
  const [message, setMessage] = useState<string | null>(null);

  function onChangeOfImageSelectionType(
    event: React.ChangeEvent<{ value: SelectionType }>
  ) {
    setImageSelectionType(event.target.value);
  }

  function onChangeOfAssigneesPerImage(
    event: React.ChangeEvent<{ value: number }>
  ) {
    setAssigneesPerImage(event.target.value);
  }

  function handleClose() {
    // Reset defaults values
    setImageSelectionType(SelectionType.All);
    setAssigneesPerImage(1);
    // Close dialog
    setOpen(false);
  }

  function getImagesUids(): string[] {
    if (imageSelectionType === SelectionType.Selected) {
      return props.selectedImagesUids;
    }
    return props.metadata.map(({ id }) => id as string);
  }

  function autoAssignImages(): void {
    // get images to use for assignment
    const imagesUids = getImagesUids();
    shuffle(imagesUids);

    // get all combinations of k assignees
    const kCombs: number[][] = kCombinations(
      [...Array(props.collaborators.length).keys()], //array of indexes
      assigneesPerImage // k, number of people each image is assigned to
    );
    shuffle(kCombs);

    // initialise assignment count
    const assignmentCount: { [name: string]: number } = {};
    props.collaborators.forEach(({ name }) => {
      assignmentCount[name] = 0;
    });

    imagesUids.forEach((uid, i) => {
      const assignees: string[] = kCombs[i % kCombs.length].map((j) => {
        const collab = props.collaborators[j];
        assignmentCount[collab.name] += 1;
        return collab.email;
      });

      props.updateAssignees(assignees, [uid]);
    });

    console.log(assignmentCount);
  }

  useEffect(() => {
    if (props.collaborators.length === 0) {
      setMessage("Not enough collaborators in this project.");
      return;
    }
    // Update select imges options
  }, [props.collaborators]);

  const dialogContent = (
    <div style={{ padding: "10px" }}>
      {/* Select images to assign */}
      <FormControl variant="standard">
        <InputLabel>Images to assign:</InputLabel>
        <Select
          value={imageSelectionType}
          onChange={onChangeOfImageSelectionType}
        >
          <MenuItem value={SelectionType.All}>All</MenuItem>
          {props.selectedImagesUids.length && (
            <MenuItem value={SelectionType.Selected}>Selected</MenuItem>
          )}
        </Select>
      </FormControl>
      {/* Select number of assignees per image */}
      <FormControl variant="standard">
        <InputLabel>Assignees per image:</InputLabel>
        <Select
          value={assigneesPerImage}
          onChange={onChangeOfAssigneesPerImage}
        >
          {props.collaborators.map((c, i) => {
            const value = i + 1;
            return (
              <MenuItem key={`${value}-assignees`} value={value}>
                {value}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>

      <div className={classes.container}>
        <Button
          className={classes.button}
          onClick={() => {
            autoAssignImages();
            setOpen(false);
          }}
          variant="outlined"
        >
          Assign
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <BaseIconButton
        tooltip={tooltips.addAssignees}
        onClick={() => setOpen(!open)}
        tooltipPlacement="top"
      />
      <Dialog open={open} onClose={handleClose}>
        <Card className={classes.card}>
          <Paper
            elevation={0}
            variant="outlined"
            square
            className={classes.paperHeader}
          >
            <Typography className={classes.topography}>
              Auto-assign images
            </Typography>
            <IconButton onClick={handleClose}>
              <Close />
            </IconButton>
          </Paper>
          <Paper elevation={0} square className={classes.paperBody}>
            {dialogContent}
          </Paper>
        </Card>
      </Dialog>
    </>
  );
}
