import { ReactElement } from "react";

import { theme, MuiCard, List, ListItem, ListItemText } from "@gliff-ai/style";
import { Filter } from "@/interfaces";

const list = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  color: "brown",
};
const listItem = {
  padding: `${theme.spacing(0)}, ${theme.spacing(0)}`,
  marginLeft: theme.spacing(1),
  marginBottom: theme.spacing(1),
  marginTop: theme.spacing(1),
  width: "auto",
  border: "1px solid",
  borderColor: theme.palette.text.secondary,
  borderRadius: "10px",
};

interface Props {
  activeFilters: Filter[];
  callback: (filter: Filter) => void;
}

export function SearchFilterCard({
  activeFilters,
  callback,
}: Props): ReactElement {
  return (
    <MuiCard
      sx={{
        width: "100%",
        height: "auto",
        backgroundColor: theme.palette.primary.light,
      }}
    >
      <List
        component="div"
        disablePadding
        sx={{
          ...list,
        }}
      >
        {activeFilters.map((f) => (
          <ListItem
            key={`${f.key}: ${f.value}`}
            onClick={() => callback(f)}
            sx={{ ...listItem }}
            button
            dense
          >
            <ListItemText
              primary={`${f.key}: ${f.value}`}
              sx={{
                paddingLeft: theme.spacing(2),
                color: theme.palette.text.secondary,
              }}
            />
          </ListItem>
        ))}
      </List>
    </MuiCard>
  );
}
