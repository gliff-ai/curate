import React, { ReactElement, useState } from "react";
import {
  AppBar,
  IconButton,
  Toolbar,
  Typography,
  SwipeableDrawer,
} from "@material-ui/core";
import { Menu } from "@material-ui/icons";

interface Props {
  drawerContent: ReactElement;
}

export default function BaseDrawer({ drawerContent }: Props): ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  const menuIcon = (
    <IconButton aria-label="Menu" onClick={toggleDrawer}>
      <Menu fontSize="large" />
    </IconButton>
  );

  return (
    <>
      {menuIcon}
      <SwipeableDrawer
        anchor="left"
        open={isOpen}
        onClose={toggleDrawer}
        onOpen={toggleDrawer}
      >
        <AppBar position="static">
          <Toolbar>
            {menuIcon}
            <Typography variant="h6">CURATE</Typography>
          </Toolbar>
        </AppBar>
        {drawerContent}
      </SwipeableDrawer>
    </>
  );
}
