import { ReactElement } from "react";
import {
  AppBar,
  IconButton,
  Toolbar,
  Typography,
  Drawer,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Menu } from "@material-ui/icons";

const drawerWidth = 300;

const useStyles = makeStyles({
  drawer: {
    width: (props: Props) => Number(props.isOpen) * drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
});
interface Props {
  isOpen: boolean;
  handleDrawerClose: () => void;
  drawerContent: ReactElement;
}

export default function LeftDrawer(props: Props): ReactElement {
  const { drawer, drawerPaper } = useStyles(props);

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={props.isOpen}
      className={`${drawer} ${drawerPaper}`}
    >
      <AppBar position="static">
        <Toolbar>
          <IconButton aria-label="Menu" onClick={props.handleDrawerClose}>
            <Menu fontSize="large" />
          </IconButton>
          <Typography variant="h6">CURATE</Typography>
        </Toolbar>
      </AppBar>
      {props.drawerContent}
    </Drawer>
  );
}
