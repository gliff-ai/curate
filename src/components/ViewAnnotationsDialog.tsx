/* eslint-disable react/jsx-props-no-spreading */
import { useState, useEffect } from "react";
import {
  BaseTextButton,
  icons,
  Dialogue,
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
  compare: boolean; // if true, render two autocompletes and pass two usernames to annotateCallback
}

export function ViewAnnotationsDialog(props: Props): React.ReactElement {
  const [username1, setUsername1] = useState<{ label: string; email: string }>({
    label: "",
    email: "",
  });
  const [username2, setUsername2] = useState<{ label: string; email: string }>({
    label: "",
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
    <Dialogue
      title={props.compare ? "Compare Annotations" : "View Annotations"}
      TriggerButton={
        <IconButton
          icon={props.compare ? icons.convert : icons.showHidePassword}
          tooltip={
            props.compare
              ? tooltips.compareAnnotations
              : tooltips.viewAnnotation
          }
          size="small"
          id={props.compare ? "id-compare-annotations" : "id-view-annotations"}
        />
      }
      close={close}
    >
      <Box sx={{ width: "400px" }}>
        <Typography sx={{ marginBottom: "20px" }}>
          {props.compare
            ? "Select two assignees to compare their annotations for this image."
            : "Select an assignee to view their annotation for this image."}
        </Typography>

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
              label={props.compare ? "User 1" : "User"}
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

        {props.compare && (
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
                label={props.compare ? "User 2" : "User"}
                sx={{
                  fontSize: 14,
                  marginBottom: "20px",
                }}
              />
            )}
            options={props.users}
            fullWidth
          />
        )}

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
              !props.users
                .map((user) => user.email)
                .includes(username1?.email) ||
              (props.compare &&
                !props.users
                  .map((user) => user.email)
                  .includes(username2?.email))
            }
            text="Confirm"
            onClick={() => {
              props.annotateCallback(username1.email, username2.email); // username2.email will be "" when compare===false, which will have the same effect as not passing it
            }}
          />
        </Box>
      </Box>
    </Dialogue>
  );
}
