/* eslint-disable react/jsx-props-no-spreading */
import { useState, useEffect } from "react";
import {
  BaseTextButton,
  icons,
  Dialog,
  IconButton,
  Box,
  Autocomplete,
  TextField,
  Typography,
} from "@gliff-ai/style";
import { tooltips } from "@/components";

interface Props {
  users: { label: string; email: string }[];
  annotateCallback: (username1: string, username2: string) => void;
}

export function ViewAnnotationsDialog(props: Props): React.ReactElement {
  const [username1, setUsername1] = useState<{ label: string; email: string }>({
    label: "",
    email: "",
  });
  const [username2, setUsername2] = useState<{ label: string; email: string }>({
    label: "Nobody",
    email: "",
  });
  const [close, setClose] = useState<boolean>(false);

  useEffect(() => {
    if (close) {
      setClose(false);
      setUsername1({ label: "", email: "" });
    }
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
        />
      }
      close={close}
    >
      <Box sx={{ width: "400px" }}>
        <Autocomplete
          onChange={(event, value) => {
            setUsername1(value as { label: string; email: string });
          }}
          key="input-user1"
          placeholder=""
          value={username1}
          renderInput={(params) => (
            <TextField
              {...params}
              label="User"
              autoFocus
              sx={{
                fontSize: 14,
                marginBottom: "20px",
              }}
            />
          )}
          options={props.users}
          fullWidth
        />

        <Typography sx={{ marginBottom: "20px" }}>Compare with:</Typography>

        <Autocomplete
          onChange={(event, value) => {
            setUsername2(value as { label: string; email: string });
          }}
          key="input-user2"
          placeholder=""
          value={username2}
          renderInput={(params) => (
            <TextField
              {...params}
              label="User"
              sx={{
                fontSize: 14,
                marginBottom: "20px",
              }}
            />
          )}
          options={[...props.users, { label: "Nobody", email: "" }]}
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
            disabled={
              !props.users.map((user) => user.email).includes(username1?.email)
            }
            text="Confirm"
            onClick={() => {
              props.annotateCallback(username1.email, username2.email);
            }}
          />
        </Box>
      </Box>
    </Dialog>
  );
}
