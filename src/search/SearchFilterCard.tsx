import { ReactElement } from "react";
import { theme, MuiCard, List, ListItem, ListItemText } from "@gliff-ai/style";
import { Filters, FilterData } from "@/filter";

interface Props {
  filters: Filters;
  updateData: (func: (data: FilterData) => FilterData) => void;
}

export function SearchFilterCard({ filters, updateData }: Props): ReactElement {
  return (
    <MuiCard
      sx={{
        width: "100%",
        height: "auto",
        backgroundColor: theme.palette.primary.light,
        padding: filters.hasAnyFilters() ? "10px" : "0px",
      }}
    >
      <List
        component="div"
        disablePadding
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          margin: 0,
        }}
      >
        {filters.activeFilters.map((f) => (
          <ListItem
            key={`${f.key}: ${f.value}`}
            onClick={() => {
              filters.toggleFilter(f);
              updateData(filters.filterData);
            }}
            sx={{
              padding: `${theme.spacing(0)}, ${theme.spacing(0)}`,
              marginTop: "5px",
              width: "auto",
              border: "1px solid",
              borderColor: theme.palette.text.secondary,
              borderRadius: "9px",
              maxWidth: "255px",
            }}
            button
            dense
          >
            <ListItemText
              primary={`${f.key}: ${f.value}`}
              sx={{
                paddingLeft: theme.spacing(2),
                color: theme.palette.text.secondary,
                overflow: "hidden",
                display: "-webkit-box",
                "-webkit-box-orient": "vertical",
                "-webkit-line-clamp": "2",
              }}
            />
          </ListItem>
        ))}
      </List>
    </MuiCard>
  );
}
