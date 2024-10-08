import { useEffect, useState } from "react";
import { SelectChangeEvent } from "@mui/material";
import {
  Button,
  icons,
  MenuItem,
  FormControl,
  Dialogue,
  IconButton,
  Chip,
  Box,
  Input,
  InputLabel,
  Select,
} from "@gliff-ai/style";
import { Profile } from "@/interfaces";

interface Props {
  profiles: Profile[];
  selectedImagesUids: string[];
  updateAssignees: (imageUids: string[], newAssignees: string[][]) => void;
  getCurrentAssignees: () => string[];
}

export function AssigneesDialog(props: Props): React.ReactElement {
  const [closeDialog, setCloseDialog] = useState<boolean>(false);
  const [assignees, setAssignees] = useState<string[]>([]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent<string[]>
  ) => {
    setAssignees(event.target.value as string[]);
  };

  useEffect(() => {
    if (closeDialog) {
      setCloseDialog(false);
    }
  }, [closeDialog]);

  const isEnabled = (): boolean =>
    props.profiles.length !== 0 && props.selectedImagesUids.length !== 0;
  useEffect(() => {
    setAssignees(props.getCurrentAssignees());
  }, [props.selectedImagesUids, props.getCurrentAssignees]);

  const multiInputForm = (
    <>
      <FormControl>
        <InputLabel>Assignees:</InputLabel>
        <Select
          multiple
          value={assignees}
          onChange={handleChange}
          input={<Input />}
          renderValue={(selected) =>
            selected.map((value) => (
              <Chip
                key={`chip-assignee-${value}`}
                label={value}
                variant="outlined"
              />
            ))
          }
        >
          {props.profiles.map(({ name, email }) => (
            <MenuItem key={name} value={email}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        text="Assign"
        onClick={() => {
          props.updateAssignees(
            props.selectedImagesUids,
            props.selectedImagesUids.map(() => assignees)
          );
          setCloseDialog(!closeDialog);
        }}
        sx={{
          margin: "0 auto",
          marginTop: "20px",
          display: "block",
        }}
      />
    </>
  );

  return (
    <>
      <Dialogue
        title="Assign selected images"
        close={closeDialog}
        TriggerButton={
          <IconButton
            tooltip={{
              name: "Assign selected images",
            }}
            icon={icons.usersPage}
            size="small"
            id="update-assignees"
            disabled={!isEnabled()}
          />
        }
      >
        <Box
          sx={{
            width: "400px",
          }}
        >
          {multiInputForm}
        </Box>
      </Dialogue>
    </>
  );
}
