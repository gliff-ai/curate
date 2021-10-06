import { useEffect, useState } from "react";
import {
  Paper,
  Card,
  Dialog,
  Typography,
  makeStyles,
  Input,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  Chip,
  Button,
} from "@material-ui/core";
import { BaseIconButton, theme } from "@gliff-ai/style";
import { tooltips } from "@/components";
import { Profile } from "./interfaces";

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
  selectInput: { maxWidth: "400px" },
  chip: {
    margin: "5px 5px 0 0",
    borderRadius: "9px",
    color: theme.palette.text.secondary,
  },
}));

interface Props {
  profiles: Profile[];
  selectedImagesUids: string[];
  updateAssignees: (value: string[]) => void;
  getCurrentAssignees: () => string[];
}

export function AssigneesDialog(props: Props): React.ReactElement {
  const classes = useStyles();
  const [open, setOpen] = useState<boolean>(false);
  const [assignees, setAssignees] = useState<string[]>([]);

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setAssignees(event.target.value as string[]);
  };

  const handleChangeMultiple = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const { options } = event.target as HTMLSelectElement;
    const value: string[] = [];
    for (let i = 0, l = options.length; i < l; i += 1) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
    setAssignees(value);
  };

  useEffect(() => {
    setAssignees(props.getCurrentAssignees());
  }, [props.selectedImagesUids, props.getCurrentAssignees]);

  const multiInputForm = (
    <>
      <FormControl>
        <InputLabel>Assignees:</InputLabel>
        <Select
          className={classes.selectInput}
          labelId="demo-mutiple-chip-label"
          id="demo-mutiple-chip"
          multiple
          value={assignees}
          onChange={handleChange}
          input={<Input id="select-multiple-chip" />}
          renderValue={(selected) => (
            <>
              {(selected as string[]).map((value) => (
                <Chip
                  key={`chip-assignee-${value}`}
                  className={classes.chip}
                  label={value}
                  variant="outlined"
                />
              ))}
            </>
          )}
        >
          {props.profiles.map(({ name, email }) => (
            <MenuItem key={name} value={email}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <div className={classes.container}>
        <Button
          className={classes.button}
          onClick={() => {
            props.updateAssignees(assignees);
            setOpen(false);
          }}
          variant="outlined"
        >
          Assign
        </Button>
      </div>
    </>
  );

  return (
    <>
      <BaseIconButton
        tooltip={tooltips.addAssignees}
        onClick={() => setOpen(!open)}
        tooltipPlacement="top"
      />
      <Dialog open={open} onClose={() => setOpen(false)}>
        <Card className={classes.card}>
          <Paper
            elevation={0}
            variant="outlined"
            square
            className={classes.paperHeader}
          >
            <Typography className={classes.topography}>
              Assign selected images
            </Typography>
          </Paper>
          <Paper elevation={0} square className={classes.paperBody}>
            {multiInputForm}
          </Paper>
        </Card>
      </Dialog>
    </>
  );
}
