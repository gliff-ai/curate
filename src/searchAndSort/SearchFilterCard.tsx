import { ReactElement } from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { List, ListItem, ListItemText, Card } from "@material-ui/core";
import { Clear } from "@material-ui/icons";
import { Filter } from "@/interfaces";

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    width: "100%",
    height: "auto",
    marginBottom: "15px",
    backgroundColor: theme.palette.primary.light,
  },

  list: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  listItem: {
    padding: `${theme.spacing(0)}, ${theme.spacing(0)}`,
    marginLeft: theme.spacing(1),
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
    width: "auto",
    border: "1px solid",
    borderColor: theme.palette.text.secondary,
    borderRadius: "10px",
  },
  icon: {
    color: theme.palette.text.secondary,
    fontSize: "14px",
    marginRight: "-5px",
    marginLeft: "-5px",
  },
  text: {
    paddingLeft: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
}));

interface Props {
  activeFilters: Filter[];
  callback: (filter: Filter) => void;
}

export default function SearchFilterCard({
  activeFilters,
  callback,
}: Props): ReactElement {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <List component="div" disablePadding className={classes.list}>
        {activeFilters.map((f) => (
          <ListItem
            key={`${f.key}: ${f.value}`}
            onClick={() => callback(f)}
            className={classes.listItem}
            button
            dense
          >
            <Clear className={classes.icon} />
            <ListItemText
              primary={`${f.key}: ${f.value}`}
              className={classes.text}
            />
          </ListItem>
        ))}
      </List>
    </Card>
  );
}
