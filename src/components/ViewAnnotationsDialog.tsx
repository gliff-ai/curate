import { useState, ChangeEvent, useEffect } from "react";
import SVG from "react-inlinesvg";
import {
  BaseTextButton,
  theme,
  icons,
  Dialog,
  IconButton,
  MuiIconbutton,
  Box,
  FormControlLabel,
  Checkbox,
  CardContent,
  Avatar,
  Chip,
  InputBase,
  Autocomplete,
  TextField,
} from "@gliff-ai/style";
import { tooltips } from "@/components";

interface Props {
  users: string[];
}

export function ViewAnnotationsDialog(props: Props): React.ReactElement {
  const [username1, setUsername1] = useState<string>("");

  return (
    <Dialog
      title="View Annotations"
      TriggerButton={
        <IconButton
          icon={icons.plugins}
          tooltip={tooltips.viewAnnotations}
          size="small"
          id="view-annotations"
          onClick={() => {
            //
          }}
        ></IconButton>
      }
    >
      <Box sx={{ width: "400px" }}>
        <CardContent>
          <Autocomplete
            onChange={(event, value) => {
              setUsername1(value);
            }}
            onInputChange={(event, value) => {
              setUsername1(value);
            }}
            key="input-user1"
            placeholder=""
            value={username1}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Username"
                // onKeyPress={(e) => {
                //   if (e.key === "Enter") {
                //     handleAddLabel(newLabel)();
                //   }
                // }}
                autoFocus
                sx={{
                  fontSize: 14,
                  width: "225px",
                  marginBottom: "20px",
                  borderBottom: "solid 1px #dadde9",
                }}
              />
            )}
            options={props.users}
          />

          <Box
            sx={{
              display: "flex",
              marginTop: "20px",
              justifyContent: "space-between",
            }}
          >
            <BaseTextButton
              id="cancel-view-annotations"
              text="Cancel"
              onClick={() => {}}
              variant="outlined"
            />
            <BaseTextButton
              id="confirm-view-annotations"
              disabled={!props.users.includes(username1)}
              text="Confirm"
              onClick={() => {}}
            />
          </Box>
        </CardContent>
      </Box>
    </Dialog>
  );
}
