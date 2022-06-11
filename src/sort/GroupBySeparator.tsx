import { ReactElement } from "react";
import { Grid } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { MetaItem } from "@/interfaces";
import { getMonthAndYear } from "@/helpers";

const useStyles = makeStyles({
  container: { width: "100%", height: "100%" },
  separator: {
    margin: "0 10px",
    paddingLeft: "5px",
    fontSize: "20px",
    fontWeight: 500,
    borderBottom: "solid 2px",
  },
});

interface Props {
  mitem: MetaItem;
  sortedBy: string;
}

function GroupBySeparator({ mitem, sortedBy }: Props): ReactElement {
  const classes = useStyles();

  return sortedBy && mitem.newGroup ? (
    <Grid className={classes.container}>
      <div className={classes.separator}>
        {sortedBy?.toLowerCase().includes("date")
          ? getMonthAndYear(mitem[sortedBy] as string)
          : mitem[sortedBy]}
      </div>
    </Grid>
  ) : null;
}
export { GroupBySeparator };
