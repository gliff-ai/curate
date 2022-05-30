import { useState, useEffect } from "react";
import {
  BaseTextButton,
  icons,
  Dialog,
  IconButton,
  Box,
  Autocomplete,
  TextField,
} from "@gliff-ai/style";
import { tooltips } from "@/components";

interface Props {
  users: string[];
  annotateCallback: (username: string) => void;
}

export function ViewAnnotationsDialog(props: Props): React.ReactElement {
  const [username1, setUsername1] = useState<string>("");
  const [close, setClose] = useState<boolean>(false);

  useEffect(() => {
    if (close) setClose(false);
  }, [close]);

  return (
    <Dialog
      title="View Annotations"
      TriggerButton={
        <IconButton
          icon={icons.showHidePassword}
          tooltip={tooltips.viewAnnotations}
          size="small"
          id="view-annotations"
        ></IconButton>
      }
      close={close}
    >
      <Box sx={{ width: "400px" }}>
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
              label="User email"
              autoFocus
              sx={{
                fontSize: 14,
                marginBottom: "20px",
                borderBottom: "solid 1px #dadde9",
              }}
            />
          )}
          options={props.users}
          fullWidth
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
            onClick={() => {
              setClose(true);
            }}
            variant="outlined"
          />
          <BaseTextButton
            id="confirm-view-annotations"
            disabled={!props.users.includes(username1)}
            text="Confirm"
            onClick={() => {
              props.annotateCallback(username1);
            }}
          />
        </Box>
      </Box>
    </Dialog>
  );
}
