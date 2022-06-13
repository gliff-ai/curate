import { ReactElement } from "react";
import { Grid, Box } from "@gliff-ai/style";
import { MetaItem } from "@/interfaces";

const separator = {
  margin: "0 10px",
  paddingLeft: "5px",
  fontSize: "20px",
  fontWeigth: 500,
  borderBottom: "solid 2px",
};

interface Props {
  mitem: MetaItem;
  sortedBy: string;
  getMonthAndYear: (date: string) => string;
}

function GroupBySeparator({
  mitem,
  sortedBy,
  getMonthAndYear,
}: Props): ReactElement {
  return sortedBy && mitem.newGroup ? (
    <Grid sx={{ width: "100%", height: "100%" }}>
      <Box sx={{ ...separator }}>
        {sortedBy?.toLowerCase().includes("date")
          ? getMonthAndYear(mitem[sortedBy] as string)
          : mitem[sortedBy]}
      </Box>
    </Grid>
  ) : null;
}
export { GroupBySeparator };
