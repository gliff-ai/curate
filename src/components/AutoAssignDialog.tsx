import { useEffect, useState, ReactElement, ChangeEvent } from "react";
import {
  BaseTextButton,
  icons,
  Alert,
  Dialog,
  Box,
  MenuItem,
  IconButton,
  InputLabel,
  FormControl,
  Select,
  Button,
} from "@gliff-ai/style";
import { kCombinations, shuffle } from "../helpers";
import { Metadata, MetaItem, Profile, UserAccess } from "@/interfaces";

interface Props {
  profiles: Profile[];
  selectedImagesUids: string[];
  metadata: Metadata;
  updateAssignees: (imageUids: string[], newAssinees: string[][]) => void;
}

enum SelectionType {
  "All" = 0,
  "Selected" = 1,
}

enum AssigneesType {
  "EntireTeam",
  "MembersAndCollaborators",
  "Collaborators",
}
enum AssignmentType {
  "New" = 0,
  "Integrative" = 1,
}

export type AssignmentCount = { [email: string]: number };

type Info = {
  hasAssignedImages: boolean;
  hasUnevenNumOfAssignees: boolean;
  maxNumOfAssignees: number;
};

type Message = {
  text: string;
  severity: "info" | "warning" | "error" | "success";
};

interface AssignmentResult {
  newAssignees?: string[][];
  newImageUids?: string[];
  hasError?: boolean;
}

export function AutoAssignDialog(props: Props): ReactElement {
  const [imageSelectionType, setImageSelectionType] = useState<number>(
    SelectionType.All
  );
  const [assigneesType, setAssigneesType] = useState<AssigneesType>(
    AssigneesType.EntireTeam
  );
  const [assignmentType, setAssignmentType] = useState<AssignmentType>(
    AssignmentType.New
  );
  const [assigneesPerImage, setAssigneesPerImage] = useState<number>(1);
  const [options, setOptions] = useState<number[]>(
    getOptions(props.profiles.length)
  );

  const [imageUids, setImageUids] = useState<string[] | null>(null);
  const [assignees, setAssignees] = useState<Profile[] | null>(null);
  const [info, setInfo] = useState<Info | null>(null);
  const [message, setMessage] = useState<Message | null>(null);

  function onChangeOfImageSelectionType(event: ChangeEvent<HTMLInputElement>) {
    setImageSelectionType(Number(event.target.value));
  }

  function onChangeAssigneesType(event: ChangeEvent<HTMLInputElement>) {
    setAssigneesType(Number(event.target.value));
  }

  function onChangeOfAssigneesPerImage(event: ChangeEvent<HTMLInputElement>) {
    setAssigneesPerImage(Number(event.target.value));
  }

  function onChangeOfAssignmentType(event: ChangeEvent<HTMLInputElement>) {
    setAssignmentType(Number(event.target.value));
  }

  const resetDefaults = (): void => {
    // Reset defaults values
    setMessage(null);
    updateInfo();
    setImageSelectionType(SelectionType.All);
    setImageSelectionType(AssignmentType.New);
  };

  function updateImageUids(): void {
    const newImageUids: string[] =
      imageSelectionType === SelectionType.Selected
        ? props.selectedImagesUids
        : props.metadata.map(({ id }) => id as string);

    shuffle(newImageUids);

    setImageUids(newImageUids);
  }

  function updateInfo(): void {
    if (!imageUids) return;

    const assigneesLenghts = props.metadata
      .filter(
        ({ id, assignees }) =>
          imageUids.includes(id as string) &&
          (assignees as string[]).length !== 0
      )
      .map(({ assignees }) => (assignees as string[]).length);

    setInfo({
      hasAssignedImages: assigneesLenghts.length > 0,
      hasUnevenNumOfAssignees: assigneesLenghts.some(
        (l) => l !== assigneesLenghts[0]
      ),
      maxNumOfAssignees: Math.max(Math.max.apply(Math, assigneesLenghts), 1),
    });
  }

  function updateMessage(): void {
    if (!info || requiresConfirmation()) return;

    if (assignees.length === 0) {
      setMessage({
        text: "No collaborator or member has been added to this project.",
        severity: "error",
      });
    } else if (
      assignmentType === AssignmentType.New &&
      info.hasAssignedImages
    ) {
      setMessage({
        text: `One or more of the selected images are already assigned.\n
        Clicking on the 'ASSIGN' button will override the initial assignment.`,
        severity: "warning",
      });
    } else if (
      assignmentType === AssignmentType.Integrative &&
      info.hasUnevenNumOfAssignees
    ) {
      setMessage({
        text: `Different number of assignees per image.\n
        Please ensure the initial assignment is correct
        before proceeding with the integrative assignment.`,
        severity: "warning",
      });
    } else {
      setMessage(null);
    }
  }

  function getOptions(end: number, start: number = 1): number[] {
    return Array.from(Array(end - start + 1), (_, i) => i + start);
  }

  function requiresConfirmation(): boolean {
    return (
      (message && message?.severity === "success") ||
      message?.severity === "error"
    );
  }

  function selectNextCombination(
    assignmentCount: { [name: string]: number },
    kCombs: string[][]
  ): number {
    /* Select a combination, so as to minimise the range of the number of images
    assigned to each profiles. */

    let minRange = Number.MAX_SAFE_INTEGER;
    let selectedIndex: number;

    // for each combination..
    kCombs.forEach((combination, i) => {
      let newCounts: number[] = [];
      // and each profile, calculate new image count
      assignees.forEach(({ email }) => {
        newCounts.push(
          combination.includes(email)
            ? assignmentCount[email] + 1
            : assignmentCount[email]
        );
      });

      // calculate range of number of images assigned to each profiles
      const newRange =
        Math.max.apply(Math, newCounts) - Math.min.apply(Math, newCounts);

      // update minimum range, if required
      if (newRange < minRange) {
        minRange = newRange;
        selectedIndex = i;
      }
    });

    return selectedIndex;
  }

  function initialAssignment(
    kCombs: string[][],
    assignmentCount: AssignmentCount
  ): AssignmentResult {
    const totImages = imageUids.length;
    const startLastRound = totImages - (totImages % kCombs.length);

    const newAssignees: string[][] = [];
    let currComb: string[];
    imageUids.forEach((uid, i) => {
      // select optimal combination
      if (i < startLastRound) {
        currComb = kCombs[i % kCombs.length];
      } else {
        const index = selectNextCombination(assignmentCount, kCombs);
        [currComb] = kCombs.splice(index, 1);
      }

      // update count and store result
      currComb.forEach((email) => (assignmentCount[email] += 1));
      newAssignees.push(currComb);
    });

    return { newAssignees };
  }

  function integrativeAssignment(
    kCombs: string[][],
    assignmentCount: { [name: string]: number }
  ): AssignmentResult {
    const totImages = imageUids.length;
    const totCombs = kCombs.length;
    const numOfRounds = Math.ceil(totImages / totCombs);
    const startLastRound = totImages - (totImages % totCombs);

    let allCombs: string[] = [];
    for (let i = 0; i < numOfRounds; i += 1) {
      allCombs = allCombs.concat(kCombs.map((comb) => JSON.stringify(comb)));
    }

    // Filter and sort metadata items by the length of assignees (descending), so
    // as to process assigned images first, partially assigned second, unassigned last.
    const metadata = props.metadata
      .filter(({ id }) => imageUids.includes(id as string))
      .sort((a: MetaItem, b: MetaItem): number =>
        (a.assignees as string[]).length > (b.assignees as string[]).length
          ? -1
          : 1
      );

    const newImageUids: string[] = [];
    const newAssignees: string[][] = [];
    let lastCombs: string[][];
    let hasError = false;

    for (let i = 0; i < metadata.length; i++) {
      const { id, assignees } = metadata[i] as {
        id: string;
        assignees: string[];
      };
      const assigneesLenght = assignees.length;

      // if image is fully assigned
      if (assigneesLenght === assigneesPerImage) {
        const index = allCombs.indexOf(JSON.stringify(assignees.sort()));

        if (index === -1) {
          hasError = true; // imbalanced assignment
          break;
        }
        assignees.forEach((email) => (assignmentCount[email] += 1)); // update assignees count
        allCombs.splice(index, 1); // remove used combination

        // if image is partially assigned
      } else {
        let currComb: string[];
        if (assigneesLenght > 0 && assigneesLenght < assigneesPerImage) {
          const viableCombs: string[][] = allCombs
            .filter(
              (comb, i, newCombs) =>
                newCombs.indexOf(comb) === i && // unique combinations
                assignees.every((email) => comb.includes(email))
            )
            .map((comb) => JSON.parse(comb));

          if (viableCombs.length === 0) {
            hasError = true; // imbalanced assignment
            break;
          }

          const index = selectNextCombination(assignmentCount, viableCombs); // select combination
          currComb = viableCombs[index];
          allCombs.splice(allCombs.indexOf(JSON.stringify(currComb)), 1); // remove used combination

          // if image is unassigned
        } else if (assignees.length === 0) {
          if (lastCombs === undefined) {
            // convert conbinations from string to string[]
            lastCombs = allCombs.map((comb) => JSON.parse(comb)) as string[][];
          }
          const index =
            i < startLastRound
              ? 0
              : selectNextCombination(assignmentCount, lastCombs); // select combination
          [currComb] = lastCombs.splice(index, 1); // remove used combination
        }

        // update count and store result
        currComb.forEach((email) => (assignmentCount[email] += 1));
        newImageUids.push(id);
        newAssignees.push(currComb);
      }
    }

    return { newImageUids, newAssignees, hasError };
  }

  function autoAssignImages(): void {
    // get all combinations of k profiles
    const kCombs: string[][] = kCombinations(
      assignees.map(({ email }) => email),
      assigneesPerImage // number of profiles each image is assigned to
    ).map((comb) => comb.sort());

    shuffle(kCombs);

    // initialise assignment count
    const assignmentCount: AssignmentCount = {};
    assignees.forEach(({ email }) => {
      assignmentCount[email] = 0;
    });

    const result =
      assignmentType === AssignmentType.New
        ? initialAssignment(kCombs, assignmentCount)
        : integrativeAssignment(kCombs, assignmentCount);

    if (result?.hasError) {
      setMessage({
        text: "The initial assignement cannot result in a balanced assignement.",
        severity: "error",
      });
      return;
    }

    props.updateAssignees(
      result?.newImageUids || imageUids,
      result?.newAssignees
    );

    setMessage({
      text: "Images assigned.",
      severity: "success",
    });
  }

  useEffect(() => {
    // always runs when dialog opens
    updateImageUids();
  }, [props.metadata, imageSelectionType]);

  useEffect(() => {
    // update users included in the assignment
    let newAssignees;
    if (assigneesType === AssigneesType.EntireTeam) {
      newAssignees = props.profiles;
    } else if (assigneesType === AssigneesType.MembersAndCollaborators) {
      newAssignees = props.profiles.filter(
        (p) => p.access !== UserAccess.Owner
      );
    } else {
      newAssignees = props.profiles.filter(
        (p) => p.access === UserAccess.Collaborator
      );
    }
    setAssignees(newAssignees);
  }, [props.profiles, assigneesType]);

  useEffect(() => {
    updateInfo();
  }, [props.metadata, imageUids]);

  useEffect(() => {
    updateMessage();
  }, [info, assignees, assignmentType]);

  useEffect(() => {
    if (!assignees) return;
    const start =
      assignmentType === AssignmentType.Integrative
        ? info?.maxNumOfAssignees
        : 1;
    const newOptions = getOptions(assignees.length, start);

    if (newOptions.length > 0) {
      setAssigneesPerImage(newOptions[0]);
      setOptions(newOptions);
    }
  }, [assignees, assignmentType, info]);

  const dialogContent = (
    <Box sx={{ padding: "10px" }}>
      {/* select images to assign */}
      <FormControl>
        <InputLabel>Images to assign:</InputLabel>
        <Select
          value={imageSelectionType}
          onChange={onChangeOfImageSelectionType}
          variant="standard"
        >
          <MenuItem value={SelectionType.All}>All</MenuItem>
          {props.selectedImagesUids.length && (
            <MenuItem value={SelectionType.Selected}>Selected</MenuItem>
          )}
        </Select>
      </FormControl>
      <br />
      {/* select assignees */}
      <FormControl>
        <InputLabel>Assignees:</InputLabel>
        <Select
          value={assigneesType}
          onChange={onChangeAssigneesType}
          variant="standard"
        >
          <MenuItem value={AssigneesType.EntireTeam}>Entire Team</MenuItem>
          <MenuItem value={AssigneesType.MembersAndCollaborators}>
            Members And Collaborators
          </MenuItem>
          <MenuItem value={AssigneesType.Collaborators}>Collaborators</MenuItem>
        </Select>
      </FormControl>
      {/* select type of assignment */}
      <br />
      {info && info.hasAssignedImages && (
        <FormControl>
          <InputLabel>Type of assignment:</InputLabel>
          <Select
            value={assignmentType}
            onChange={onChangeOfAssignmentType}
            variant="standard"
          >
            <MenuItem value={AssignmentType.New}>New</MenuItem>

            <MenuItem value={AssignmentType.Integrative}>Integrative</MenuItem>
          </Select>
        </FormControl>
      )}
      <br />

      {/* select number of assignees per image */}
      <FormControl>
        <InputLabel>Assignees per image:</InputLabel>
        <Select
          value={assigneesPerImage}
          onChange={onChangeOfAssigneesPerImage}
          variant="standard"
        >
          {options.map((option) => (
            <MenuItem key={`${option}-assignees`} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <BaseTextButton
        id="assign"
        text="Assign"
        onClick={autoAssignImages}
        disabled={requiresConfirmation()}
        sx={{ display: "block", margin: "auto", marginTop: "20px" }}
      />
    </Box>
  );

  return (
    <Dialog
      title="Auto-Assign Images"
      TriggerButton={
        <IconButton
          tooltip={{
            name: "Auto-Assign Images",
          }}
          icon={icons.autoAssign}
          size="small"
          id="auto-assign-images"
          tooltipPlacement="top"
        />
      }
      afterClose={resetDefaults}
    >
      <Box
        sx={{
          width: "450px",
          "& .MuiAlert-root": {
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
          },
          "& .MuiAlert-message": {
            marginLeft: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          },
        }}
      >
        {message ? (
          <Alert severity={message.severity}>
            {message.text}
            {requiresConfirmation() && (
              <Button onClick={resetDefaults} color="inherit">
                Ok
              </Button>
            )}
          </Alert>
        ) : null}

        {dialogContent}
      </Box>
    </Dialog>
  );
}
