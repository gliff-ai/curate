import {
  useEffect,
  useState,
  ReactElement,
  ChangeEvent,
  useCallback,
  useMemo,
} from "react";
import {
  Button,
  icons,
  Alert,
  Dialogue,
  Box,
  MenuItem,
  IconButton,
  InputLabel,
  FormControl,
  Select,
  MuiButton,
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

  function getOptions(end: number, start = 1): number[] {
    return Array.from(Array(end - start + 1), (_, i) => i + start);
  }

  const [options, setOptions] = useState<number[]>(
    getOptions(props.profiles.length)
  );

  const [imageUids, setImageUids] = useState<string[] | null>(null);
  const [assignees, setAssignees] = useState<Profile[] | null>(null);
  const [info, setInfo] = useState<Info | null>(null);
  const [message, setMessage] = useState<Message | null>(null);

  const onChangeOfImageSelectionType = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setImageSelectionType(Number(event.target.value));
    },
    [setImageSelectionType]
  );

  const onChangeAssigneesType = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setAssigneesType(Number(event.target.value));
    },
    [setAssigneesType]
  );

  const onChangeOfAssigneesPerImage = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setAssigneesPerImage(Number(event.target.value));
    },
    [setAssigneesPerImage]
  );

  const onChangeOfAssignmentType = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setAssignmentType(Number(event.target.value));
    },
    [setAssignmentType]
  );

  const updateInfo = useCallback((): void => {
    if (!imageUids) return;

    const assigneesLengths = props.metadata
      .filter(
        (mitem) => imageUids.includes(mitem.id) && mitem.assignees.length !== 0
      )
      .map((mitem) => mitem.assignees.length);

    setInfo({
      hasAssignedImages: assigneesLengths.length > 0,
      hasUnevenNumOfAssignees: assigneesLengths.some(
        (l) => l !== assigneesLengths[0]
      ),
      maxNumOfAssignees: Math.max(...assigneesLengths, 1),
    });
  }, [imageUids, props.metadata, setInfo]);

  const resetDefaults = useCallback((): void => {
    // Reset defaults values
    setMessage(null);
    updateInfo();
    setImageSelectionType(SelectionType.All);
    setImageSelectionType(AssignmentType.New);
  }, [setMessage, updateInfo, setImageSelectionType, setImageSelectionType]);

  const updateImageUids = useCallback((): void => {
    const newImageUids: string[] =
      imageSelectionType === SelectionType.Selected
        ? props.selectedImagesUids
        : props.metadata.map(({ id }) => id);

    shuffle(newImageUids);

    setImageUids(newImageUids);
  }, [
    imageSelectionType,
    props.selectedImagesUids,
    props.metadata,
    setImageUids,
  ]);

  const requiresConfirmation = useMemo(
    (): boolean =>
      (message && message?.severity === "success") ||
      message?.severity === "error",
    [message]
  );

  const updateMessage = useCallback((): void => {
    if (!info || requiresConfirmation) return;

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
  }, [assignmentType, assignees, info, requiresConfirmation]);

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
      const newCounts: number[] = [];
      // and each profile, calculate new image count
      assignees.forEach(({ email }) => {
        newCounts.push(
          combination.includes(email)
            ? assignmentCount[email] + 1
            : assignmentCount[email]
        );
      });

      // calculate range of number of images assigned to each profiles
      const newRange = Math.max(...newCounts) - Math.min(...newCounts);

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
      currComb.forEach((email) => {
        assignmentCount[email] += 1;
      });
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
      .filter(({ id }) => imageUids.includes(id))
      .sort((a: MetaItem, b: MetaItem): number =>
        a.assignees.length > b.assignees.length ? -1 : 1
      );

    const newImageUids: string[] = [];
    const newAssignees: string[][] = [];
    let lastCombs: string[][];
    let hasError = false;

    for (let i = 0; i < metadata.length; i += 1) {
      const { id, assignees: currAssignees } = metadata[i] as {
        id: string;
        assignees: string[];
      };

      const assigneesLength = currAssignees.length;

      // if image is fully assigned
      if (assigneesLength === assigneesPerImage) {
        const index = allCombs.indexOf(JSON.stringify(currAssignees.sort()));

        if (index === -1) {
          hasError = true; // imbalanced assignment
          break;
        }
        currAssignees.forEach((email) => {
          assignmentCount[email] += 1;
        }); // update currAssignees count
        allCombs.splice(index, 1); // remove used combination

        // if image is partially assigned
      } else {
        let currComb: string[];
        if (assigneesLength > 0 && assigneesLength < assigneesPerImage) {
          const viableCombs: string[][] = allCombs
            .filter(
              (comb, j, newCombs) =>
                newCombs.indexOf(comb) === j && // unique combinations
                currAssignees.every((email) => comb.includes(email))
            )
            .map((comb) => JSON.parse(comb) as string[]);

          if (viableCombs.length === 0) {
            hasError = true; // imbalanced assignment
            break;
          }

          const index = selectNextCombination(assignmentCount, viableCombs); // select combination
          currComb = viableCombs[index];
          allCombs.splice(allCombs.indexOf(JSON.stringify(currComb)), 1); // remove used combination

          // if image is unassigned
        } else if (currAssignees.length === 0) {
          if (lastCombs === undefined) {
            // convert conbinations from string to string[]
            lastCombs = allCombs.map((comb) => JSON.parse(comb) as string[]);
          }
          const index =
            i < startLastRound
              ? 0
              : selectNextCombination(assignmentCount, lastCombs); // select combination
          [currComb] = lastCombs.splice(index, 1); // remove used combination
        }

        // update count and store result
        currComb.forEach((email) => {
          assignmentCount[email] += 1;
        });
        newImageUids.push(id);
        newAssignees.push(currComb);
      }
    }

    return { newImageUids, newAssignees, hasError };
  }

  const autoAssignImages = useCallback((): void => {
    // get all combinations of k profiles
    const kCombs: string[][] = kCombinations(
      assignees.map(({ email }) => email),
      assigneesPerImage // number of profiles each image is assigned to
    ).map((comb) => comb.sort()) as string[][];

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
  }, [
    props.updateAssignees,
    setMessage,
    assignees,
    assignmentType,
    info,
    assigneesPerImage,
    imageUids,
    initialAssignment,
    integrativeAssignment,
  ]);

  useEffect(() => {
    // always runs when dialog opens
    updateImageUids();
  }, [updateImageUids]);

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
  }, [props.profiles, assigneesType, setAssignees]);

  useEffect(() => {
    updateInfo();
  }, [updateInfo]);

  useEffect(() => {
    updateMessage();
  }, [updateMessage]);

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
  }, [assignees, assignmentType, info, setAssigneesPerImage, setOptions]);

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
      <Button
        id="assign"
        text="Assign"
        onClick={autoAssignImages}
        disabled={requiresConfirmation}
        sx={{ display: "block", margin: "auto", marginTop: "20px" }}
      />
    </Box>
  );

  return (
    <Dialogue
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
            {requiresConfirmation && (
              <MuiButton onClick={resetDefaults} color="inherit">
                Ok
              </MuiButton>
            )}
          </Alert>
        ) : null}

        {dialogContent}
      </Box>
    </Dialogue>
  );
}
