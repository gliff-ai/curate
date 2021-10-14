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
  IconButton,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import SVG from "react-inlinesvg";
import { BaseIconButton, BaseTextButton, theme } from "@gliff-ai/style";
import { tooltips } from "@/components";
import { Profile } from "./interfaces";
import { kCombinations, shuffle, imgSrc } from "@/helpers";
import { Metadata } from "@/searchAndSort/interfaces";

const useStyles = makeStyles(() => ({
  paperHeader: { padding: "10px", backgroundColor: theme.palette.primary.main },
  paperBody: { margin: "15px", width: "450px" },
  container: { textAlign: "center", marginTop: "20px" },
  card: {
    display: "flex",
    flexDirection: "column",
    width: "auto",
    hegith: "400px",
  },
  topography: {
    color: "#000000",
    display: "inline",
    fontSize: "21px",
    marginRight: "125px",
  },
  alert: {
    width: "auto",
  },
  contentContainer: { padding: "10px" },
  closeButton: {
    position: "absolute",
    top: "7px",
    right: "5px",
  },
  closeIcon: { width: "15px" },
}));

interface Props {
  collaborators: Profile[];
  selectedImagesUids: string[];
  metadata: Metadata;
  updateAssignees: (imageUids: string[], newAssinees: string[][]) => void;
}

enum SelectionType {
  "All" = 0,
  "Selected" = 1,
}

type Message = {
  text: string;
  severify: "info" | "warning" | "error" | "success";
};

export function AutoAssignDialog(props: Props): React.ReactElement {
  const classes = useStyles();
  const [open, setOpen] = useState<boolean>(false);
  const [imageSelectionType, setImageSelectionType] = useState<number>(
    SelectionType.All
  );
  const [assigneesPerImage, setAssigneesPerImage] = useState<number>(1);
  const [message, setMessage] = useState<Message | null>(null);

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

  function anyAssignedImage(): boolean {
    const imagesUids = getImagesUids();
    return props.metadata.some(
      ({ id, assignees }) =>
        imagesUids.includes(id as string) &&
        (assignees as string[]).length !== 0
    );
  }

  function updateMessage(): void {
    if (props.collaborators.length === 0) {
      setMessage({
        text: "No collaborator has been added to this project.",
        severify: "error",
      });
    } else if (anyAssignedImage()) {
      setMessage({
        text: "One or more of the selected images are already assigned.",
        severify: "warning",
      });
    } else {
      setMessage(null);
    }
  }

  function selectNextCombination(
    assignmentCount: { [name: string]: number },
    kCombsLastRound: Set<number[]>
  ): number[] {
    /* Select a combination, so as to minimise the range of the number of images
    assigned to each collaborators. */

    let minRange = Number.MAX_SAFE_INTEGER;
    let selectedCombination: number[];

    // for each combination..
    kCombsLastRound.forEach((combination) => {
      let newCounts: number[] = [];
      // and each collaborator, calculate new image count
      props.collaborators.forEach((collaborator, i) => {
        newCounts.push(
          combination.includes(i)
            ? assignmentCount[collaborator.name] + 1
            : assignmentCount[collaborator.name]
        );
      });

      // calculate range of number of images assigned to each collaborators
      const newRange =
        Math.max.apply(Math, newCounts) - Math.min.apply(Math, newCounts);

      // update minimum range, if required
      if (newRange < minRange) {
        minRange = newRange;
        selectedCombination = combination;
      }
    });

    // remove selected combination from last round and return it
    kCombsLastRound.delete(selectedCombination);
    return selectedCombination;
  }

  function autoAssignImages(): void {
    // get images to use for assignment
    const imagesUids = getImagesUids();
    shuffle(imagesUids);

    // get all combinations of k collaborators
    const kCombs: number[][] = kCombinations(
      [...Array(props.collaborators.length).keys()], //array of indexes
      assigneesPerImage // number of collaborators each image is assigned to
    );
    shuffle(kCombs);

    // initialise assignment count
    const assignmentCount: { [name: string]: number } = {};
    props.collaborators.forEach(({ name }) => {
      assignmentCount[name] = 0;
    });

    const totImages = imagesUids.length;
    const newAssignees: string[][] = [];
    const startLastRound = totImages - (totImages % kCombs.length);
    const kCombsLastRound = new Set(kCombs);

    let currentCombination: number[];
    imagesUids.forEach((uid, i) => {
      // select combination of colleagues to be assigned to the next image
      if (i < startLastRound) {
        currentCombination = kCombs[i % kCombs.length];
      } else {
        currentCombination = selectNextCombination(
          assignmentCount,
          kCombsLastRound
        );
      }

      // get assignees for the current combination and update the image count for each assignee
      newAssignees.push(
        currentCombination.map((j) => {
          assignmentCount[props.collaborators[j].name] += 1;
          return props.collaborators[j].email;
        })
      );
    });

    props.updateAssignees(imagesUids, newAssignees);

    setMessage({
      text: "Images assigned.",
      severify: "success",
    });

    console.log(assignmentCount);
  }

  useEffect(() => {
    if (open) {
      updateMessage();
    }
  }, [props.collaborators, imageSelectionType, open]);

  const dialogContent = (
    <div className={classes.contentContainer}>
      {/* select images to assign */}
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
      {/* select number of assignees per image */}
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
        <BaseTextButton
          text="Assign"
          onClick={autoAssignImages}
          disabled={Boolean(message?.severify === "error")}
        />
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
            <IconButton className={classes.closeButton} onClick={handleClose}>
              <SVG src={imgSrc("close")} className={classes.closeIcon} />
            </IconButton>
          </Paper>
          <Paper elevation={0} square className={classes.paperBody}>
            {message ? (
              <Alert className={classes.alert} severity={message.severify}>
                {message.text}
              </Alert>
            ) : null}
            {dialogContent}
          </Paper>
        </Card>
      </Dialog>
    </>
  );
}
